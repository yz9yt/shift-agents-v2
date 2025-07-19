import { LLMClient } from "./client";
import { type ToolName, TOOLS } from "./tools";
import type {
  AgentConfig,
  AgentStatus,
  APIMessage,
  APIToolCall,
  OpenRouterConfig,
  ToolContext,
} from "./types";

import { type FrontendSDK } from "@/types";
import { getCurrentReplayRequest } from "@/utils";

export class Agent {
  private messages: APIMessage[] = [];
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
    this.messages.push({
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

  get conversation(): APIMessage[] {
    return [...this.messages];
  }

  private async handleToolCall(
    toolCall: APIToolCall,
    context: ToolContext
  ): Promise<APIMessage> {
    const toolName = toolCall.function.name as ToolName;
    const tool = TOOLS[toolName];

    if (!tool) {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: `Error while executing tool ${toolName}: Tool not found, available tools: ${Object.keys(
          TOOLS
        ).join(", ")}`,
      };
    }

    try {
      const argsString = toolCall.function.arguments?.trim() ?? "";
      const rawArgs = argsString === "" ? {} : JSON.parse(argsString);
      const validatedArgs = tool.schema.parse(rawArgs);
      const result = await (tool.handler as any)(validatedArgs, context);

      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: JSON.stringify(result),
      };
    } catch (error) {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: `Error while executing tool ${toolName}: ${error}`,
      };
    }
  }

  async sendMessage(content: string): Promise<void> {
    this.messages.push({ role: "user", content });
    await this.processMessages();
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;
    const currentRequest = await getCurrentReplayRequest(
      this.config.jitConfig.replaySessionId
    );

    while (iterations < this.config.jitConfig.maxIterations) {
      this.status = "queryingAI";

      const context = `Current request:\n<request_raw>\n${currentRequest.raw}\n</request_raw>`;
      const messages = [
        ...this.messages,
        {
          role: "user" as const,
          content: context,
        },
      ];

      const assistantMessageIndex =
        this.messages.push({
          role: "assistant",
          content: "",
        }) - 1;

      let hasToolCalls = false;
      let shouldPause = false;

      try {
        await this.llmClient.streamLLM(messages, {
          onChunk: (content) => {
            this.messages[assistantMessageIndex]!.content += content;
          },
          onError: (error) => {
            this.status = "error";
            this.messages[assistantMessageIndex]!.content = error;
            console.error(`Agent ${this.id} error:`, error);
          },
          onFinish: (response) => {
            this.messages[assistantMessageIndex] = response;
            if (!hasToolCalls) {
              this.status = "idle";
            }
          },
          onToolCall: async (toolCalls) => {
            hasToolCalls = true;
            this.status = "callingTools";
            this.messages[assistantMessageIndex]!.tool_calls = toolCalls;

            for (const toolCall of toolCalls) {
              if (toolCall.function.name === "pause") {
                shouldPause = true;
                this.status = "idle";
                this.messages.push({
                  role: "assistant",
                  content: "Agent paused",
                });
                return;
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

              const toolResponse = await this.handleToolCall(toolCall, toolContext);
              this.messages.push(toolResponse);
            }
          },
        });

        if (shouldPause) {
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
        this.messages.push({
          role: "assistant",
          content: `Error in agent processing: ${error}`,
        });
        console.error(`Agent ${this.id} processing error:`, error);
        return;
      }
    }

    this.status = "idle";
    this.messages.push({
      role: "assistant",
      content: `Agent ${this.id} hit max iterations`,
    });
    console.warn(`Agent ${this.id} hit max iterations`);
  }
}
