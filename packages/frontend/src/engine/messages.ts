import { type ToolResult } from "@/engine/types";
import {
  type APIMessage,
  type FrontendMetadata,
  type UIMessage,
} from "@/engine/types/agent";
import { generateId } from "@/utils";

export class MessageManager {
  private apiMessages = new Map<string, APIMessage>();
  private uiMessages = new Map<string, UIMessage>();

  addUserMessage(content: string): string {
    const id = generateId();
    const apiMessage: APIMessage = {
      role: "user",
      content,
    };
    const uiMessage: UIMessage = {
      kind: "user",
      content,
    };

    this.apiMessages.set(id, apiMessage);
    this.uiMessages.set(id, uiMessage);

    return id;
  }

  addSystemMessage(content: string): string {
    const id = generateId();
    const apiMessage: APIMessage = {
      role: "system",
      content,
    };

    this.apiMessages.set(id, apiMessage);
    return id;
  }

  addAssistantMessage(content: string): string {
    const id = generateId();
    const apiMessage: APIMessage = {
      role: "assistant",
      content,
    };
    const uiMessage: UIMessage = {
      kind: "assistant",
      content,
    };

    this.apiMessages.set(id, apiMessage);
    this.uiMessages.set(id, uiMessage);

    return id;
  }

  addToolMessage<TOutput>(toolCall: ToolResult<TOutput>): string {
    const id = generateId();

    if (toolCall.kind === "success") {
      this.apiMessages.set(id, {
        role: "tool",
        content: JSON.stringify(toolCall.result),
        tool_call_id: toolCall.id,
      });

      this.uiMessages.set(id, {
        kind: "tool",
        status: "success",
        metadata: toolCall.uiMessage,
        content: JSON.stringify(toolCall.result),
      });
    } else {
      this.apiMessages.set(id, {
        role: "tool",
        content: toolCall.error,
        tool_call_id: toolCall.id,
      });

      this.uiMessages.set(id, {
        kind: "tool",
        status: "error",
        metadata: toolCall.uiMessage,
        content: toolCall.error,
      });
    }

    return id;
  }

  addProcessingToolMessage(metadata: FrontendMetadata): string {
    const id = generateId();

    this.uiMessages.set(id, {
      kind: "tool",
      status: "processing",
      metadata,
    });

    return id;
  }

  completeToolMessage<TOutput>(
    id: string,
    toolCall: ToolResult<TOutput>
  ): void {
    switch (toolCall.kind) {
      case "success":
        this.apiMessages.set(id, {
          role: "tool",
          content: JSON.stringify(toolCall.result),
          tool_call_id: toolCall.id,
        });

        this.updateMessage(id, {
          ui: (draft) => ({
            ...draft,
            status: "success" as const,
            metadata: toolCall.uiMessage,
            content: JSON.stringify(toolCall.result),
          }),
        });
        break;

      case "error":
        this.apiMessages.set(id, {
          role: "tool",
          content: toolCall.error,
          tool_call_id: toolCall.id,
        });

        this.updateMessage(id, {
          ui: (draft) => ({
            ...draft,
            status: "error" as const,
            metadata: toolCall.uiMessage,
            content: toolCall.error,
          }),
        });
        break;
    }
  }

  addErrorMessage(error: string): string {
    const id = generateId();
    const apiMessage: APIMessage = {
      role: "assistant",
      content: "An error occurred: " + error,
    };

    const uiMessage: UIMessage = {
      kind: "error",
      content: error,
    };

    this.apiMessages.set(id, apiMessage);
    this.uiMessages.set(id, uiMessage);

    return id;
  }

  updateMessage(
    id: string,
    updater: {
      api?: (draft: APIMessage) => APIMessage;
      ui?: (draft: UIMessage) => UIMessage;
    }
  ): void {
    if (updater.api !== undefined) {
      const apiMessage = this.apiMessages.get(id);
      if (apiMessage !== undefined) {
        this.apiMessages.set(id, updater.api(apiMessage));
      }
    }

    if (updater.ui !== undefined) {
      const uiMessage = this.uiMessages.get(id);
      if (uiMessage !== undefined) {
        this.uiMessages.set(id, updater.ui(uiMessage));
      }
    }
  }

  updateAssistantMessage(id: string, content: string): void {
    const apiMessage = this.apiMessages.get(id);
    if (apiMessage !== undefined && apiMessage.role === "assistant") {
      this.apiMessages.set(id, {
        ...apiMessage,
        content,
      });
    }

    const uiMessage = this.uiMessages.get(id);
    if (uiMessage !== undefined && uiMessage.kind === "assistant") {
      this.uiMessages.set(id, {
        ...uiMessage,
        content,
      });
    }
  }

  getApiMessages(): APIMessage[] {
    return [...this.apiMessages.values()];
  }

  getUiMessages(): UIMessage[] {
    return [...this.uiMessages.values()];
  }

  clear(): void {
    this.apiMessages.clear();
    this.uiMessages.clear();
  }
}
