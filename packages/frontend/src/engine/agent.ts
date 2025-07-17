import type {
  Message,
  ToolCall,
  AgentConfig,
  AgentStatus,
  OpenRouterConfig,
  BaseToolResult,
} from "./types";
import { TOOLS, type ToolName } from "./tools";
import { LLMClient } from "./client";
import { FrontendSDK } from "@/types";
import { getCurrentReplayRequestRaw } from "./tools/tempUtils";

export class Agent {
  private messages: Message[] = [];
  private llmClient: LLMClient;
  private status: AgentStatus = "idle";
  private maxIterations: number;
  private replaySessionId: number;
  private sdk: FrontendSDK;

  constructor(
    sdk: FrontendSDK,
    private config: AgentConfig,
    openRouterConfig: OpenRouterConfig
  ) {
    if (!config.jitConfig) {
      throw new Error("JIT config is required");
    }
    this.replaySessionId = config.jitConfig.replaySessionId;
    this.llmClient = new LLMClient(openRouterConfig);
    this.maxIterations = config.jitConfig.maxIterations || 50;
    this.sdk = sdk;
    const initialPrompt = `<SYSTEM_PROMPT>${config.systemPrompt}</SYSTEM_PROMPT><JIT_INSTRUCTIONS>${config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>`;
    this.messages.push({
      role: "system",
      content: initialPrompt,
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

  private async currentRequestRaw() {
    return await getCurrentReplayRequestRaw(this.sdk, this.replaySessionId);
  }

  private async handleToolCall(
    toolCall: ToolCall,
    currentRequestRaw: string
  ): Promise<BaseToolResult> {
    const toolName = toolCall.function.name as ToolName;
    const tool = TOOLS[toolName];

    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const rawArgs = JSON.parse(toolCall.function.arguments);
    // Inject rawRequest into the arguments
    const argsWithRawRequest = {
      rawRequest: currentRequestRaw,
      ...rawArgs,
    };
    // Use type assertion since we know the tool type at runtime
    const validatedArgs = tool.schema.parse(argsWithRawRequest as any);
    const result = await (tool.handler as any)(validatedArgs);

    return {
      currentRequestRaw: result.currentRequestRaw,
      success: result.success,
      error: result.error,
      findings: result.findings,
    };
  }

  async sendMessage(content: string): Promise<void> {
    this.messages.push({ role: "user", content });
    await this.processMessages();
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;

    while (iterations < this.maxIterations) {
      this.status = "thinking";

      const result = await this.llmClient.callLLM(this.messages);
      switch (result.kind) {
        case "Success":
          this.messages.push(result.data);

          if (result.data.tool_calls?.length) {
            this.status = "calling-tool";
            let currentRequestRaw = await this.currentRequestRaw();
            for (const toolCall of result.data.tool_calls) {
              const toolResponse = await this.handleToolCall(
                toolCall,
                currentRequestRaw
              );
              currentRequestRaw = toolResponse.currentRequestRaw;
              //Update the messages here and also update the raw request and send.
              this.messages.push(toolResponse);
            }
          } else {
            this.status = "idle";
            return;
          }
          break;
        case "Error":
          this.status = "error";
          console.error(`Agent ${this.id} error:`, result.error);
          return;
      }

      iterations++;
    }

    if (iterations >= this.maxIterations) {
      this.status = "idle";
      console.warn(`Agent ${this.id} hit max iterations`);
    }
  }
}
