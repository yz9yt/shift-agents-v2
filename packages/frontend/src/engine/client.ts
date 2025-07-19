import { toolDefinitions } from "./tools";
import type { APIMessage, APIToolCall, OpenRouterConfig } from "./types";

export class LLMClient {
  constructor(private config: OpenRouterConfig) {}

  async streamLLM(
    messages: APIMessage[],
    callbacks?: {
      onChunk?: (content: string) => void;
      onToolCall?: (toolCalls: APIToolCall[]) => Promise<void>;
      onFinish?: (response: APIMessage) => void;
      onError?: (error: string) => void;
    }
  ) {
    const stream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          tools: toolDefinitions,
          stream: true,
        }),
      }
    );

    const reader = stream.body?.getReader();
    if (!reader) {
      const error = "No reader from LLM";
      callbacks?.onError?.(error);
      return { kind: "Error", error };
    }

    const toolCallsMap = new Map<number, APIToolCall>();
    let content = "";
    let role: "user" | "assistant" | "system" | "tool" = "assistant";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          if (line.slice(6) === "[DONE]") {
            break;
          }

          const data = JSON.parse(line.slice(6));

          const delta = data.choices?.[0]?.delta;
          if (delta) {
            if (delta.role) {
              role = delta.role;
            }
            if (delta.content) {
              content += delta.content;
              callbacks?.onChunk?.(delta.content);
            }
            if (delta.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const index = toolCall.index;
                if (!toolCallsMap.has(index)) {
                  toolCallsMap.set(index, {
                    id: toolCall.id || "",
                    type: "function",
                    function: {
                      name: toolCall.function?.name || "",
                      arguments: "",
                    },
                  });
                }

                const existingToolCall = toolCallsMap.get(index)!;
                if (toolCall.id) {
                  existingToolCall.id = toolCall.id;
                }
                if (toolCall.function?.name) {
                  existingToolCall.function.name = toolCall.function.name;
                }
                if (toolCall.function?.arguments) {
                  existingToolCall.function.arguments +=
                    toolCall.function.arguments;
                }
              }
            }
          }

          const finishReason = data.choices?.[0]?.finish_reason;
          if (finishReason === "tool_calls") {
            const toolCalls = Array.from(toolCallsMap.values());
            await callbacks?.onToolCall?.(toolCalls);
          } else if (finishReason === "stop") {
            break;
          }
        }
      }
    }

    const toolCalls = Array.from(toolCallsMap.values());
    const response: APIMessage = {
      role,
      content: content !== "" ? content : null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    };

    callbacks?.onFinish?.(response);

    return { kind: "Success", data: response };
  }
}
