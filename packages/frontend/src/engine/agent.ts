import type { Message, ToolCall, AgentConfig, AgentStatus, OpenRouterConfig } from "./types";
import { TOOLS, type ToolName } from "./tools";
import { LLMClient } from "./client";

export class Agent {
  private messages: Message[] = [];
  private llmClient: LLMClient;
  private status: AgentStatus = "idle";
  private maxIterations: number;

  constructor(private config: AgentConfig, openRouterConfig: OpenRouterConfig) {
    this.llmClient = new LLMClient(openRouterConfig);
    this.maxIterations = config.maxIterations ?? 5;
    this.messages.push({
      role: "system",
      content: config.systemPrompt,
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

  private async handleToolCall(toolCall: ToolCall): Promise<Message> {
    const toolName = toolCall.function.name as ToolName;
    const tool = TOOLS[toolName];

    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const rawArgs = JSON.parse(toolCall.function.arguments);
    const validatedArgs = tool.schema.parse(rawArgs);
    const result = await tool.handler(validatedArgs);

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

    while (iterations < this.maxIterations) {
      this.status = "thinking";

      const result = await this.llmClient.callLLM(this.messages);
      switch (result.kind) {
        case "Success":
          this.messages.push(result.data);

          if (result.data.tool_calls?.length) {
            this.status = "calling-tool";

            for (const toolCall of result.data.tool_calls) {
              const toolResponse = await this.handleToolCall(toolCall);
              this.messages.push(toolResponse);
            }
          } else {
            this.status = "idle";
            break;
          }
          break;
        case "Error":
          this.status = "error";
          console.error(`Agent ${this.id} error:`, result.error);
          break;
      }

      iterations++;
    }

    if (iterations >= this.maxIterations) {
      this.status = "idle";
      console.warn(`Agent ${this.id} hit max iterations`);
    }
  }
}
