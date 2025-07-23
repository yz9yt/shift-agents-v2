import { executeTool, TOOLS } from "@/engine/tools";
import { LLMClient } from "./client";

import { MessageManager } from "@/engine/messages";
import {
  ToolFunction,
  type AgentConfig,
  type AgentStatus,
  type APIMessage,
  type APIToolCall,
  type ToolContext,
  type ToolResult,
  type UIMessage,
} from "@/engine/types";
import { type FrontendSDK } from "@/types";
import { getCurrentReplayRequest } from "@/utils";

class ToolCallManager {
  private toolMessages = new Map<string, string>();

  constructor(private messageManager: MessageManager) {}

  handlePartialToolCall(toolCall: APIToolCall): void {
    const toolKey = this.getToolKey(toolCall);
    const toolName = toolCall.function.name || "...";

    if (!this.toolMessages.has(toolKey)) {
      const id = this.messageManager.addProcessingToolMessage({
        icon: "fas fa-spinner fa-spin",
        message: toolName ? `Preparing ${toolName}...` : "Preparing tool...",
      });
      this.toolMessages.set(toolKey, id);
    } else {
      this.updateToolMessage(toolKey, {
        icon: "fas fa-spinner fa-spin",
        message: toolName ? `Preparing ${toolName}...` : "Preparing tool...",
      });
    }
  }

  handleCompleteToolCall(toolCall: APIToolCall): string {
    const toolKey = this.getToolKey(toolCall);

    if (this.toolMessages.has(toolKey)) {
      const id = this.toolMessages.get(toolKey)!;
      this.updateToolMessage(toolKey, {
        icon: "fas fa-spinner fa-spin",
        message: "Processing...",
      });
      return id;
    } else {
      const id = this.messageManager.addProcessingToolMessage({
        icon: "fas fa-spinner fa-spin",
        message: "Processing...",
      });
      this.toolMessages.set(toolKey, id);
      return id;
    }
  }

  private getToolKey(toolCall: APIToolCall): string {
    return `${toolCall.id}_${toolCall.function.name}`;
  }

  private updateToolMessage(
    toolKey: string,
    metadata: { icon: string; message: string }
  ): void {
    const id = this.toolMessages.get(toolKey)!;
    this.messageManager.updateMessage(id, {
      ui: (draft) => {
        if (draft.kind === "tool") {
          return {
            ...draft,
            metadata: {
              ...draft.metadata,
              ...metadata,
            },
          };
        }
        return draft;
      },
    });
  }

  completeToolMessage(toolCall: APIToolCall, result: ToolResult): void {
    const toolKey = this.getToolKey(toolCall);
    const id = this.toolMessages.get(toolKey)!;
    this.messageManager.completeToolMessage(id, result);
  }
}

export class Agent {
  public llmClient: LLMClient;
  public messageManager: MessageManager;
  public status: AgentStatus = "idle";
  private aborted: boolean = false;

  constructor(public sdk: FrontendSDK, public config: AgentConfig) {
    this.llmClient = new LLMClient(this);
    this.messageManager = new MessageManager();
    this.status = "idle";
    this.aborted = false;
    this.generateSystemPrompt();
  }

  private generateSystemPrompt(): void {
    const systemPrompt = `<SYSTEM_PROMPT>${this.config.systemPrompt}</SYSTEM_PROMPT><JIT_INSTRUCTIONS>${this.config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>`;
    this.messageManager.addSystemMessage(systemPrompt);
  }

  async sendMessage(message: string): Promise<void> {
    this.aborted = false;
    this.messageManager.addUserMessage(message);

    try {
      await this.processMessages();
    } catch (error) {
      console.error(error);
      this.messageManager.addErrorMessage(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;
    const currentRequest = await getCurrentReplayRequest(
      this.config.jitConfig.replaySessionId
    );

    while (iterations < this.config.jitConfig.maxIterations && !this.aborted) {
      this.status = "queryingAI";

      const messages: APIMessage[] = [
        ...this.messageManager.getApiMessages(),
        {
          role: "user",
          content: `Here is the current HTTP request that you are analyzing: <request>${currentRequest.raw}</request> <host>${currentRequest.host}</host> <port>${currentRequest.port}</port>`,
        },
      ];

      let currentContent = "";
      let currentReasoning = "";
      let hasToolCalls = false;
      const toolCallManager = new ToolCallManager(this.messageManager);

      let assistantMessageID = "";
      try {
        const response = this.llmClient.streamText(messages);
        assistantMessageID = this.messageManager.addAssistantMessage("");

        for await (const chunk of response) {
          if (this.aborted) {
            break;
          }

          switch (chunk.kind) {
            case "text":
              currentContent += chunk.content;
              this.messageManager.updateAssistantMessage(
                assistantMessageID,
                currentContent.trim()
              );
              break;

            case "reasoning":
              console.log("reasoning", chunk.content);
              currentReasoning += chunk.content;
              this.messageManager.updateMessage(assistantMessageID, {
                ui: (draft) => {
                  if (draft.kind === "assistant") {
                    return {
                      ...draft,
                      reasoning: currentReasoning,
                    };
                  }
                  return draft;
                },
                api: (draft) => ({
                  ...draft,
                  reasoning: currentReasoning,
                }),
              });
              break;

            case "partialToolCall":
              for (const toolCall of chunk.toolCalls) {
                toolCallManager.handlePartialToolCall(toolCall);
              }
              break;

            case "toolCall":
              console.log("toolCall", chunk.toolCalls);
              hasToolCalls = true;

              this.messageManager.updateMessage(assistantMessageID, {
                api: (draft) => ({
                  ...draft,
                  tool_calls: chunk.toolCalls,
                }),
              });

              this.status = "callingTools";

              for (const toolCall of chunk.toolCalls) {
                toolCallManager.handleCompleteToolCall(toolCall);

                const tool = TOOLS.find(
                  (tool) => tool.name === toolCall.function.name
                ) as ToolFunction;

                if (tool) {
                  const toolContext: ToolContext = {
                    sdk: this.sdk,
                    replaySession: {
                      request: currentRequest,
                      id: this.config.jitConfig.replaySessionId,
                      updateRequestRaw: (
                        updater: (draft: string) => string
                      ) => {
                        const newRequestRaw = updater(currentRequest.raw);
                        const hasChanged = newRequestRaw !== currentRequest.raw;
                        currentRequest.raw = newRequestRaw;
                        return hasChanged;
                      },
                    },
                    agent: {
                      name: this.config.name,
                    },
                  };

                  const result = await executeTool(
                    toolCall.id,
                    toolCall.function.name,
                    toolCall.function.arguments,
                    toolContext
                  );

                  toolCallManager.completeToolMessage(toolCall, {
                    kind: "success",
                    id: toolCall.id,
                    result,
                    uiMessage: result.uiMessage,
                  });
                } else {
                  toolCallManager.completeToolMessage(toolCall, {
                    kind: "error",
                    id: toolCall.id,
                    error: "Tool not found",
                    uiMessage: {
                      icon: "fas fa-exclamation-triangle",
                      message: "Tool not found",
                    },
                  });
                }
              }

              break;
          }
        }

        if (!hasToolCalls || this.aborted) {
          this.status = "idle";
          break;
        }
      } catch (error) {
        console.error(error);
        this.messageManager.deleteMessage(assistantMessageID);
        this.messageManager.addErrorMessage(
          error instanceof Error ? error.message : String(error)
        );

        this.status = "error";
        break;
      }

      iterations++;
    }

    if (this.status !== "error") {
      this.status = "idle";
    }

    if (iterations >= this.config.jitConfig.maxIterations) {
      this.messageManager.addAssistantMessage(
        "This agent hit max iterations. Please try again."
      );
    }
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

  get uiMessages(): UIMessage[] {
    return [...this.messageManager.getUiMessages()];
  }

  abort(): void {
    this.aborted = true;
    this.llmClient.abort();
    this.status = "idle";
  }
}
