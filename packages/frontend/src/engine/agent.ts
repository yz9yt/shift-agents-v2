import { LLMClient } from "./client";

import { MessageManager } from "@/engine/messages";
import { TodoManager } from "@/engine/todo";
import { executeTool, TOOLS } from "@/engine/tools";
import {
  type AgentConfig,
  type AgentStatus,
  type APIMessage,
  type APIToolCall,
  type ToolContext,
  type ToolFunction,
  type ToolResult,
  type UIMessage,
} from "@/engine/types";
import { type FrontendSDK } from "@/types";
import { getCurrentReplayRequest, type ReplayRequest } from "@/utils";

export class Agent {
  public llmClient: LLMClient;
  public messageManager: MessageManager;
  public todoManager: TodoManager;
  public status: AgentStatus = "idle";
  public inputMessage: string = "";
  public isEditingMessage: boolean = false;
  public selectedPromptId: string | undefined = undefined;
  private aborted: boolean = false;

  constructor(public sdk: FrontendSDK, public config: AgentConfig) {
    this.llmClient = new LLMClient(this.config.openRouterConfig);
    this.todoManager = new TodoManager();
    this.messageManager = new MessageManager();
    this.applySystemPrompt();
  }

  private applySystemPrompt(): void {
    const systemPrompt = `
      <SYSTEM_PROMPT>${this.config.systemPrompt}</SYSTEM_PROMPT>
      <JIT_INSTRUCTIONS>${this.config.jitConfig.jitInstructions}</JIT_INSTRUCTIONS>
    `;

    console.log("systemPrompt", systemPrompt);

    const hasSystemMessages = this.messageManager
      .getApiMessages()
      .some((message) => message.role === "system");

    if (!hasSystemMessages) {
      this.messageManager.addSystemMessage(systemPrompt);
    } else {
      this.messageManager.updateSystemMessage(systemPrompt);
    }
  }

  updateConfig(updater: (draft: AgentConfig) => void): void {
    const draft = { ...this.config };
    updater(draft);
    this.config = draft;
    this.applySystemPrompt();
  }

  async sendMessage(message: string): Promise<void> {
    this.aborted = false;
    this.applySystemPrompt();
    this.messageManager.addUserMessage(message);
    this.clearInputMessage();

    try {
      await this.processMessages();
    } catch (error) {
      console.error(error);
      this.status = "idle";
      this.messageManager.addErrorMessage(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private contextMessages({
    currentRequest,
  }: {
    currentRequest: ReplayRequest;
  }): APIMessage[] {
    const messages: APIMessage[] = [];

    switch (currentRequest.kind) {
      case "Ok":
        messages.push({
          role: "user",
          content: `Here is the current HTTP request that you are analyzing: <request>${currentRequest.raw}</request> <host>${currentRequest.host}</host> <port>${currentRequest.port}</port>`,
        });
        break;

      case "Error":
        messages.push({
          role: "user",
          content: `There was an error getting the current HTTP request: ${currentRequest.error}`,
        });
        break;
    }

    const allTodos = this.todoManager.getTodos();
    if (allTodos.length > 0) {
      const pendingTodos = allTodos.filter((todo) => todo.status === "pending");
      const completedTodos = allTodos.filter(
        (todo) => todo.status === "completed"
      );

      let message = "Here is the current status of todos:\n";

      if (completedTodos.length > 0) {
        message += "\nCompleted todos:\n";
        message += completedTodos
          .map((todo) => `- [x] ${todo.content} (ID: ${todo.id})`)
          .join("\n");
      }

      if (pendingTodos.length > 0) {
        message += "\nPending todos:\n";
        message += pendingTodos
          .map((todo) => `- [ ] ${todo.content} (ID: ${todo.id})`)
          .join("\n");
      }

      message +=
        "\n\nYou can mark pending todos as finished using the todo tool with their IDs.";

      messages.push({
        role: "user",
        content: message,
      });
    }

    return messages;
  }

  private async processMessages(): Promise<void> {
    let iterations = 0;
    const currentRequest = await getCurrentReplayRequest(
      this.sdk,
      this.config.jitConfig.replaySessionId
    );

    if (currentRequest.kind === "Error") {
      this.messageManager.addErrorMessage(currentRequest.error);
      this.status = "idle";
      return;
    }

    while (iterations < this.config.jitConfig.maxIterations && !this.aborted) {
      this.status = "queryingAI";

      let currentContent = "";
      let currentReasoning = "";
      let hasToolCalls = false;
      const toolCallManager = new ToolCallManager(this.messageManager);
      const messages = [
        ...this.messageManager.getApiMessages(),
        ...this.contextMessages({ currentRequest }),
      ];

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
              currentReasoning += chunk.content;
              this.messageManager.updateMessage(assistantMessageID, {
                ui: (draft) => {
                  if (draft.kind === "assistant") {
                    if (chunk.completed) {
                      draft.completedAt = Date.now();
                    }

                    return {
                      ...draft,
                      reasoning: currentReasoning.trim(),
                      reasoningCompleted: chunk.completed,
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

                if (tool !== undefined) {
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
                    todoManager: this.todoManager,
                  };

                  const result = await executeTool(
                    toolCall.id,
                    toolCall.function.name,
                    toolCall.function.arguments,
                    toolContext
                  );

                  if (this.aborted) {
                    break;
                  }

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
          this.todoManager.clearTodos();
          this.status = "idle";
          break;
        }
      } catch (error) {
        console.error(error);
        this.messageManager.deleteMessage(assistantMessageID);
        this.messageManager.addErrorMessage(
          error instanceof Error ? error.message : String(error)
        );

        this.todoManager.clearTodos();
        this.status = "idle";
        break;
      }

      iterations++;
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

  updateUserMessage(id: string, content: string): boolean {
    return this.messageManager.updateUserMessage(id, content);
  }

  removeMessagesAfter(messageId: string): void {
    this.messageManager.removeMessagesAfter(messageId);
  }

  removeMessage(id: string): void {
    this.messageManager.deleteMessage(id);
  }

  setInputMessage(content: string, isEditing: boolean = false): void {
    this.inputMessage = content;
    this.isEditingMessage = isEditing;
  }

  clearInputMessage(): void {
    this.inputMessage = "";
    this.isEditingMessage = false;
  }

  setSelectedPromptId(id: string): void {
    this.selectedPromptId = id;
  }

  clearSelectedPromptId(): void {
    this.selectedPromptId = undefined;
  }

  editMessage(messageId: string, content: string): void {
    this.removeMessagesAfter(messageId);
    this.removeMessage(messageId);
    this.setInputMessage(content, true);
  }

  abort(): void {
    this.aborted = true;
    this.llmClient.abort();
    this.status = "idle";
    this.messageManager.cleanupPending();
    this.todoManager.clearTodos();
  }
}

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
        message: `Processing ${toolCall.function.name}...`,
      });
      return id;
    } else {
      const id = this.messageManager.addProcessingToolMessage({
        icon: "fas fa-spinner fa-spin",
        message: `Processing ${toolCall.function.name}...`,
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
