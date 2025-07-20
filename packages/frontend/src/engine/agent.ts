import { LLMClient } from "./client";
import { type ToolName, TOOLS } from "./tools";
import type {
  AgentConfig,
  AgentStatus,
  APIMessage,
  APIToolCall,
  FrontendMessage,
  OpenRouterConfig,
  FrontendToolCall,
  ToolContext,
} from "./types";

import { type FrontendSDK } from "@/types";
import { generateId, getCurrentReplayRequest } from "@/utils";

export class Agent {
  private internalMessages: Map<string, APIMessage> = new Map();
  private frontendMessages: Map<string, FrontendMessage> = new Map();
  private llmClient: LLMClient;
  private status: AgentStatus = "idle";
  private sdk: FrontendSDK;
  private config: AgentConfig;

  constructor(
    sdk: FrontendSDK,
    config: AgentConfig,
    openRouterConfig: OpenRouterConfig
  ) {
    this.sdk = sdk;
    this.config = config;
    this.llmClient = new LLMClient(openRouterConfig);
    this.generateSystemPrompt();
  }

  private generateSystemPrompt(): void {
    const systemPrompt = `<SYSTEM_PROMPT>${this.config.systemPrompt}</SYSTEM_PROMPT><JIT_INSTRUCTIONS>${this.config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>`;
    this.internalMessages.set(generateId(), {
      role: "system",
      content: systemPrompt,
    });
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get currentStatus(): AgentStatus {
    return this.status;
  }

  get conversation(): FrontendMessage[] {
    return [...this.frontendMessages.values()];
  }

  private async handleToolCall(
    toolCall: APIToolCall,
    context: ToolContext
  ): Promise<FrontendToolCall> {
    const toolName = toolCall.function.name as ToolName;
    const tool = TOOLS[toolName];

    if (tool === undefined) {
      const errorMessage = `Error while executing tool ${toolName}: Tool not found, available tools: ${Object.keys(
        TOOLS
      ).join(", ")}`;

      return {
        kind: "error",
        message: {
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: errorMessage,
        },
      };
    }

    try {
      let argsString = toolCall.function.arguments.trim();
      if (argsString === "") {
        argsString = "{}";
      }

      const rawArgs = JSON.parse(argsString);
      const validatedArgs = tool.schema.parse(rawArgs);

      // @ts-expect-error - TODO: fix this
      const result = await tool.handler(validatedArgs, context);

      return {
        kind: "success",
        message: {
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(result),
        },
        frontend: {
          icon: tool.frontend.icon,
          // @ts-expect-error - TODO: fix this
          message: tool.frontend.message(validatedArgs),
          // @ts-expect-error - TODO: fix this
          details: tool.frontend.details?.(validatedArgs, result) ?? undefined,
        },
      };
    } catch (error) {
      return {
        kind: "error",
        message: {
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: `Error while executing tool ${toolName}: ${error}`,
        },
      };
    }
  }

  async sendMessage(content: string): Promise<void> {
    const id = generateId();
    this.internalMessages.set(id, { role: "user", content });
    this.frontendMessages.set(id, { role: "user", content });

    await this.processMessages();
  }

  private async updateInternalMessage(
    id: string,
    updater: (draft: APIMessage) => APIMessage
  ): Promise<void> {
    const message = this.internalMessages.get(id);
    if (message === undefined) {
      return;
    }

    const newMessage = updater(message);
    this.internalMessages.set(id, newMessage);
  }

  private async updateFrontendMessage(
    id: string,
    updater: (draft: FrontendMessage) => FrontendMessage
  ): Promise<void> {
    const message = this.frontendMessages.get(id);
    if (message === undefined) {
      return;
    }

    const newMessage = updater(message);
    this.frontendMessages.set(id, newMessage);
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;
    const currentRequest = await getCurrentReplayRequest(
      this.config.jitConfig.replaySessionId
    );

    while (iterations < this.config.jitConfig.maxIterations) {
      this.status = "queryingAI";

      let hasToolCalls = false;
      let shouldPause = false;

      const context = `Current request:\n<request_raw>\n${currentRequest.raw}\n</request_raw>`;
      const internalMessagesWithContext = [
        ...this.internalMessages.values(),
        {
          role: "user" as const,
          content: context,
        },
      ];

      const assistantMessageId = generateId();
      this.internalMessages.set(assistantMessageId, {
        role: "assistant",
        content: "",
      });
      this.frontendMessages.set(assistantMessageId, {
        role: "assistant",
        content: "",
      });

      try {
        await this.llmClient.streamLLM(internalMessagesWithContext, {
          onChunk: (content) => {
            this.updateInternalMessage(assistantMessageId, (draft) => ({
              ...draft,
              content: draft.content + content,
            }));

            this.updateFrontendMessage(assistantMessageId, (draft) => ({
              ...draft,
              content: draft.content + content,
            }));
          },
          onError: (error) => {
            this.status = "error";
            this.updateInternalMessage(assistantMessageId, (draft) => ({
              ...draft,
              content: error,
            }));

            this.updateFrontendMessage(assistantMessageId, (draft) => ({
              ...draft,
              role: "error",
              content: error,
            }));

            console.error(`Agent ${this.id} error:`, error);
          },
          onFinish: (response) => {
            this.updateInternalMessage(assistantMessageId, (draft) => ({
              ...draft,
              content: response.content,
            }));

            this.updateFrontendMessage(assistantMessageId, (draft) => ({
              ...draft,
              content: response.content ?? undefined,
            }));

            if (!hasToolCalls) {
              this.status = "idle";
            }
          },
          onToolCall: async (toolCalls) => {
            hasToolCalls = true;
            this.status = "callingTools";
            this.updateInternalMessage(assistantMessageId, (draft) => ({
              ...draft,
              tool_calls: toolCalls,
            }));

            for (const toolCall of toolCalls) {
              if (toolCall.function.name === "pause") {
                shouldPause = true;
              }

              const toolContext: ToolContext = {
                sdk: this.sdk,
                replaySession: {
                  request: currentRequest,
                  id: this.config.jitConfig.replaySessionId,
                  updateRequestRaw: (updater: (draft: string) => string) => {
                    const newRequestRaw = updater(currentRequest.raw);
                    const hasChanged = newRequestRaw !== currentRequest.raw;
                    currentRequest.raw = newRequestRaw;
                    return hasChanged;
                  },
                },
                agent: {
                  name: this.name,
                },
              };

              const toolResponseId = generateId();
              this.frontendMessages.set(toolResponseId, {
                role: "tool",
                content: "",
                tool_call: {
                  kind: "processing",
                  frontend: {
                    icon: "fas fa-spinner fa-spin",
                    message: "Processing...",
                  },
                },
              });

              const toolResponse = await this.handleToolCall(
                toolCall,
                toolContext
              );

              switch (toolResponse.kind) {
                case "success":
                  this.frontendMessages.set(toolResponseId, {
                    role: "tool",
                    content: toolResponse.message.content ?? undefined,
                    tool_call: toolResponse,
                  });
                  this.internalMessages.set(
                    toolResponseId,
                    toolResponse.message
                  );
                  break;
                case "error":
                  this.frontendMessages.set(toolResponseId, {
                    role: "tool",
                    content: toolResponse.message.content ?? undefined,
                    tool_call: toolResponse,
                  });
                  this.internalMessages.set(
                    toolResponseId,
                    toolResponse.message
                  );
                  break;
              }
            }
          },
        });

        if (shouldPause) {
          this.status = "idle";
          return;
        }

        if (hasToolCalls) {
          iterations++;
          continue;
        } else {
          this.status = "idle";
          return;
        }
      } catch (error) {
        this.status = "error";
        this.internalMessages.set(generateId(), {
          role: "assistant",
          content: `Error in agent processing: ${error}`,
        });

        this.frontendMessages.set(generateId(), {
          role: "error",
          content: `Error in agent processing: ${error}`,
        });
        console.error(`Agent ${this.id} processing error:`, error);
        return;
      }
    }

    this.status = "idle";
    this.internalMessages.set(generateId(), {
      role: "assistant",
      content: `Agent ${this.id} hit max iterations`,
    });

    this.frontendMessages.set(generateId(), {
      role: "assistant",
      content: `Agent ${this.id} hit max iterations`,
    });

    console.warn(`Agent ${this.id} hit max iterations`);
  }
}
