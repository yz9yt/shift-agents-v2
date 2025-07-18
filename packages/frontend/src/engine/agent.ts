import type {
  APIMessage,
  APIToolCall,
  AgentConfig,
  AgentStatus,
  OpenRouterConfig,
  BaseToolResult,
  ToolContext,
} from "./types";
import { TOOLS, type ToolName } from "./tools";
import { LLMClient } from "./client";
import { FrontendSDK } from "@/types";
import { getCurrentReplayRequestRaw, sendReplaySessionEntry } from "@/utils";

export class Agent {
  private messages: APIMessage[] = [];
  private llmClient: LLMClient;
  private status: AgentStatus = "paused";
  private sdk: FrontendSDK;

  constructor(
    sdk: FrontendSDK,
    private config: AgentConfig,
    openRouterConfig: OpenRouterConfig
  ) {
    this.sdk = sdk;
    this.llmClient = new LLMClient(openRouterConfig);
    this.generateSystemPrompt();
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

  private generateSystemPrompt() {
    const systemPrompt = `<SYSTEM_PROMPT>${this.config.systemPrompt}</SYSTEM_PROMPT><JIT_INSTRUCTIONS>${this.config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>`;
    this.messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  private async currentRequestRaw() {
    //TODO: This is a temporary solution to get the current request raw. Until the caido SDK is updated to support this.
    return await getCurrentReplayRequestRaw(
      this.config.jitConfig.replaySessionId.toString()
    );
  }

  private async sendReplayRequest(rawRequest: string) {
    //TODO: This is a temporary solution to send the request. Until the caido SDK is updated to support this.
    return await sendReplaySessionEntry(
      this.config.jitConfig.replaySessionId.toString(),
      rawRequest
    );
  }

  private async queryAIModel(currentRequestRaw: string) {
    const messages = [
      ...this.messages,
      {
        role: "user" as const,
        content: `Current request:\n\`\`\`\n${currentRequestRaw}\n\`\`\``,
      },
    ];

    console.log("messages", messages);
    const result = await this.llmClient.callLLM(messages);
    return result;
  }

  private async handleToolCall(
    toolCall: APIToolCall,
    context: ToolContext
  ): Promise<BaseToolResult> {
    const toolName = toolCall.function.name as ToolName;
    const tool = TOOLS[toolName];

    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const rawArgs = JSON.parse(toolCall.function.arguments);
    const validatedArgs = tool.schema.parse(rawArgs);
    const result = await tool.handler(validatedArgs, context);

    return result;
  }

  async sendMessage(content: string): Promise<void> {
    this.messages.push({ role: "user", content });
    await this.processMessages();
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;

    while (iterations < this.config.jitConfig.maxIterations) {
      this.status = "queryingAI";

      let currentRequestRaw = await this.currentRequestRaw();
      const result = await this.queryAIModel(currentRequestRaw);
      switch (result.kind) {
        case "Success":
          this.messages.push({
            role: "assistant",
            content: result.data.content,
          });

          console.log("result", result);

          if (result.data.tool_calls?.length) {
            this.status = "callingTools";
            for (const toolCall of result.data.tool_calls) {
              const context: ToolContext = {
                replaySessionRequestRaw: currentRequestRaw,
                replaySessionId: this.config.jitConfig.replaySessionId,
              };

              const toolResponse = await this.handleToolCall(toolCall, context);

              if (toolResponse.kind === "Success") {
                currentRequestRaw = toolResponse.data.newRequestRaw;

                if (toolResponse.data.pause) {
                  this.status = "paused";
                  return;
                }
              }

              if (toolResponse.kind === "Error") {
                this.status = "error";
                this.messages.push({
                  role: "assistant",
                  content: toolResponse.data.error,
                });
                console.error(
                  `Agent ${this.id} error:`,
                  toolResponse.data.error
                );
                return;
              }
            }
            this.status = "sendingReplayRequest";
            await this.sendReplayRequest(currentRequestRaw);
          } else {
            this.status = "paused";
            return;
          }
          break;
        case "Error":
          this.status = "error";
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
      this.status = "paused";
      this.messages.push({
        role: "assistant",
        content: `Agent ${this.id} hit max iterations`,
      });
      console.warn(`Agent ${this.id} hit max iterations`);
    }
  }
}
