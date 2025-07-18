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

  private generateSystemPrompt() {
    const systemPrompt = `<SYSTEM_PROMPT>${this.config.systemPrompt}</SYSTEM_PROMPT><JIT_INSTRUCTIONS>${this.config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>`;
    this.messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  get id() {
    return this.config.id;
  }

  get name() {
    return this.config.name;
  }

  get currentStatus() {
    return this.status;
  }

  get conversation() {
    return [...this.messages];
  }

  // This is used to query the AI model and include context in the prompt like the current request raw.
  private async queryAIModel(raw: string) {
    const context = `Current request:\n<request_raw>\n${raw}\n</request_raw>`;

    const messages = [
      ...this.messages,
      {
        role: "user" as const,
        content: context,
      },
    ];

    return await this.llmClient.callLLM(messages);
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
        content: `Error while executing tool ${toolName}: Tool not found, available tools: ${Object.keys(TOOLS).join(", ")}`,
      };
    }

    const rawArgs = JSON.parse(toolCall.function.arguments);
    const validatedArgs = tool.schema.parse(rawArgs);
    // @ts-expect-error - TODO: fix this
    const result = await tool.handler(validatedArgs, context);

    return {
      role: "tool",
      tool_call_id: toolCall.id,
      name: toolName,
      content: JSON.stringify(result),
    };
  }

  async sendMessage(content: string): Promise<void> {
    this.messages.push({ role: "user", content });
    await this.processMessages();
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;
    let currentRequest = await getCurrentReplayRequest(
      this.config.jitConfig.replaySessionId
    );

    while (iterations < this.config.jitConfig.maxIterations) {
      this.status = "queryingAI";

      const result = await this.queryAIModel(currentRequest.raw);
      switch (result.kind) {
        case "Success":
          this.messages.push(result.data);

          if (result.data.tool_calls && result.data.tool_calls.length > 0) {
            this.status = "callingTools";

            for (const toolCall of result.data.tool_calls) {
              const context: ToolContext = {
                sdk: this.sdk,
                replaySession: {
                  requestRaw: currentRequest.raw,
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

              const toolResponse = await this.handleToolCall(toolCall, context);
              this.messages.push(toolResponse);
            }

            // TODO: maybe we should instead have a sendReplayRequest tool call instead?
            this.status = "sendingReplayRequest";

            console.log("sending request", currentRequest);
            // @ts-ignore - no types yet for sendRequest
            await this.sdk.replay.sendRequest(
              this.config.jitConfig.replaySessionId,
              {
                connectionInfo: {
                  host: currentRequest.host,
                  isTLS: currentRequest.isTLS,
                  port: currentRequest.port,
                },
                raw: currentRequest.raw,
              }
            );
          } else {
            this.status = "idle";
            return;
          }
          break;
        case "Error":
          this.status = "error";

          // TODO: have a special role for errors
          this.messages.push({
            role: "assistant",
            content: result.error,
          });

          console.error(`Agent ${this.id} error:`, result.error);
          return;
      }

      iterations++;
    }

    if (iterations >= this.config.jitConfig.maxIterations) {
      this.status = "idle";

      // TODO: have a special role for this type of messages
      this.messages.push({
        role: "assistant",
        content: `Agent ${this.id} hit max iterations`,
      });

      console.warn(`Agent ${this.id} hit max iterations`);
    }
  }
}
