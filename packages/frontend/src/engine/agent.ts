import { executeTool, TOOLS } from "@/engine/tools";
import { LLMClient } from "./client";

import { MessageManager } from "@/engine/messages";
import {
  ToolFunction,
  type AgentConfig,
  type AgentStatus,
  type APIMessage,
  type ToolContext,
  type UIMessage,
} from "@/engine/types";
import { type FrontendSDK } from "@/types";
import { getCurrentReplayRequest } from "@/utils";

export class Agent {
  public llmClient: LLMClient;
  public messageManager: MessageManager;
  public status: AgentStatus = "idle";

  constructor(public sdk: FrontendSDK, public config: AgentConfig) {
    this.llmClient = new LLMClient(this);
    this.messageManager = new MessageManager();
    this.status = "idle";
    this.generateSystemPrompt();
  }

  private generateSystemPrompt(): void {
    const systemPrompt = `<SYSTEM_PROMPT>${this.config.systemPrompt}</SYSTEM_PROMPT><JIT_INSTRUCTIONS>${this.config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>`;
    this.messageManager.addSystemMessage(systemPrompt);
  }

  async sendMessage(message: string): Promise<void> {
    this.messageManager.addUserMessage(message);
    await this.processMessages();
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;
    const currentRequest = await getCurrentReplayRequest(
      this.config.jitConfig.replaySessionId
    );

    while (iterations < this.config.jitConfig.maxIterations) {
      this.status = "queryingAI";

      const messages: APIMessage[] = [
        ...this.messageManager.getApiMessages(),
        {
          role: "user",
          content: `Here is the current HTTP request that you are analyzing: <request>${currentRequest.raw}</request> <host>${currentRequest.host}</host> <port>${currentRequest.port}</port>`,
        },
      ];

      let assistantMessageID = "";
      let currentContent = "";
      let shouldPause = false;
      let hasToolCalls = false;

      try {
        const response = this.llmClient.streamText(messages);
        for await (const chunk of response) {
          switch (chunk.kind) {
            case "text":
              currentContent += chunk.content;
              if (assistantMessageID === "") {
                assistantMessageID =
                  this.messageManager.addAssistantMessage(currentContent);
              } else {
                this.messageManager.updateAssistantMessage(
                  assistantMessageID,
                  currentContent
                );
              }
              break;
            case "toolCall":
              hasToolCalls = true;

              this.messageManager.updateMessage(assistantMessageID, {
                api: (draft) => ({
                  ...draft,
                  tool_calls: chunk.toolCalls,
                }),
              });

              this.status = "callingTools";

              for (const toolCall of chunk.toolCalls) {
                const id = this.messageManager.addProcessingToolMessage({
                  icon: "fas fa-spinner fa-spin",
                  message: "Processing...",
                });

                if (toolCall.function.name === "pause") {
                  shouldPause = true;
                  this.messageManager.completeToolMessage(id, {
                    kind: "success",
                    id: toolCall.id,
                    result: "Paused",
                    uiMessage: {
                      icon: "fas fa-pause",
                      message: "Paused",
                    },
                  });
                  continue;
                }

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
                      name: this.name,
                    },
                  };

                  const result = await executeTool(
                    toolCall.id,
                    toolCall.function.name,
                    toolCall.function.arguments,
                    toolContext
                  );

                  this.messageManager.completeToolMessage(id, {
                    kind: "success",
                    id: toolCall.id,
                    result,
                    uiMessage: result.uiMessage,
                  });
                } else {
                  this.messageManager.completeToolMessage(id, {
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

        if (shouldPause || !hasToolCalls) {
          this.status = "idle";
          break;
        }
      } catch (error) {
        console.error(error);
        this.messageManager.addErrorMessage(
          error instanceof Error ? error.message : String(error)
        );

        // TODO: maybe revert back to idle state so user can query AI again, or make some frontend change
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
        "This agent hit max iterations. Please try again.",
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
}
