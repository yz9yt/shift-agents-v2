import type {
  Message,
  ToolCall,
  AgentConfig,
  AgentStatus,
  OpenRouterConfig,
  BaseToolResult,
  Finding,
} from "./types";
import { TOOLS, type ToolName } from "./tools";
import { LLMClient } from "./client";
import { FrontendSDK } from "@/types";
import { getCurrentReplayRequestRaw, sendReplaySessionEntry } from "./tools/tempUtils";

export class Agent {
  private messages: Message[] = [];
  private llmClient: LLMClient;
  private status: AgentStatus = "paused";
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
      role: "agent",
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

  private async addFinding(finding: Finding) {
    // We need to find a way to get the correct requestId from the currentReplayRequest.For now, using replaySessionID even tho that's wrong.
    this.sdk.findings.createFinding(this.replaySessionId.toString(), {
      title: finding.title,
      description: finding.markdown,
      reporter: "Shift Agent - " + this.name + " - " + this.replaySessionId,
    });
  }

  private async currentRequestRaw() {
    //TODO: This is a temporary solution to get the current request raw. Until the caido SDK is updated to support this.
    return await getCurrentReplayRequestRaw(this.sdk, this.replaySessionId);
  }

  private async sendReplayRequest(rawRequest: string) {
    //TODO: This is a temporary solution to send the request. Until the caido SDK is updated to support this.
    return await sendReplaySessionEntry(this.sdk, this.replaySessionId, rawRequest);
  }

  private async queryAIModel(currentRequestRaw: string) {
    const messages = [...this.messages, {
      role: "replay",
      content: currentRequestRaw,
    }];
    const result = await this.llmClient.callLLM(messages);
    return result;
  }

  private async handleToolCall(toolCall: ToolCall, currentRequestRaw: string): Promise<BaseToolResult> {
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
      pause: result.pause,
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
      this.status = "queryingAI";

      let currentRequestRaw = await this.currentRequestRaw();
      const result = await this.queryAIModel(currentRequestRaw);
      switch (result.kind) {
        case "Success":
          this.messages.push({
            role: "ai",
            content: result.data.content,
          });

          if (result.data.tool_calls?.length) {
            this.status = "callingTools";
            for (const toolCall of result.data.tool_calls) {
              const toolResponse = await this.handleToolCall(
                toolCall,
                currentRequestRaw
              );
              currentRequestRaw = toolResponse.currentRequestRaw;
              if (toolResponse.findings) {
                for (const finding of toolResponse.findings) {
                  await this.addFinding(finding);
                }
              }
              if (toolResponse.pause) {
                this.status = "paused";
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
            role: "error",
            content: result.error,
          });
          console.error(`Agent ${this.id} error:`, result.error);
          return;
      }

      iterations++;
    }

    if (iterations >= this.maxIterations) {
      this.status = "paused";
      this.messages.push({
        role: "error",
        content: `Agent ${this.id} hit max iterations`,
      });
      console.warn(`Agent ${this.id} hit max iterations`);
    }
  }
}
