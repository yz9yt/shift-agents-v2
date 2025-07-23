import type { Agent } from "@/engine/agent";
import { toolDefinitions } from "@/engine/tools";
import {
  type APIMessage,
  type APIToolCall,
  type DeltaToolCall,
  type StreamChunk,
} from "@/engine/types/agent";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

type StreamingState = {
  toolCallsMap: Map<number, APIToolCall>;
  buffer: string;
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  decoder: TextDecoder;
};

export class LLMClient {
  private agent: Agent;
  private abortController: AbortController | undefined;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  public async *streamText(
    messages: APIMessage[],
  ): AsyncGenerator<StreamChunk, void, unknown> {
    this.abortController = new AbortController();

    try {
      const requestBody: Record<string, unknown> = {
        model: this.agent.config.openRouterConfig.model,
        messages: messages,
        tools: toolDefinitions,
        stream: true,
      };

      if (this.agent.config.openRouterConfig.reasoningEnabled) {
        requestBody.reasoning = this.agent.config.openRouterConfig.reasoning;
      }

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.agent.config.openRouterConfig.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} ${body}`,
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const state: StreamingState = {
        toolCallsMap: new Map<number, APIToolCall>(),
        buffer: "",
        reader: response.body.getReader(),
        decoder: new TextDecoder(),
      };

      try {
        this.abortController.signal.addEventListener("abort", () => {
          if (state.reader) {
            state.reader.cancel();
          }
        });

        while (true) {
          if (!state.reader) break;

          const { done, value } = await state.reader.read();
          if (done) break;

          state.buffer += state.decoder.decode(value, { stream: true });
          const lines = state.buffer.split("\n");
          state.buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) {
              continue;
            }

            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              const delta = data.choices?.[0]?.delta;

              if (delta !== undefined) {
                if (delta.content !== undefined && delta.content !== null) {
                  yield {
                    kind: "text",
                    content: delta.content,
                  };
                }

                if (delta.reasoning !== undefined && delta.reasoning !== null) {
                  yield {
                    kind: "reasoning",
                    content: delta.reasoning,
                  };
                }

                if (delta.tool_calls !== undefined) {
                  const hasChanges = this.processToolCalls(
                    state,
                    delta.tool_calls,
                  );
                  if (hasChanges && state.toolCallsMap.size > 0) {
                    const toolCalls = Array.from(state.toolCallsMap.values());
                    yield {
                      kind: "partialToolCall",
                      toolCalls,
                    };
                  }
                }
              }

              const finishReason = data.choices?.[0]?.finish_reason;
              if (finishReason === "tool_calls") {
                const toolCalls = Array.from(state.toolCallsMap.values());
                yield {
                  kind: "toolCall",
                  toolCalls,
                };
                state.toolCallsMap.clear();
                break;
              } else if (finishReason === "stop") {
                break;
              }
            } catch (parseError) {
              continue;
            }
          }
        }

        if (state.toolCallsMap.size > 0) {
          const toolCalls = Array.from(state.toolCallsMap.values());
          yield {
            kind: "toolCall",
            toolCalls,
          };
        }
      } finally {
        if (state.reader) {
          state.reader.releaseLock();
        }
      }
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        return;
      }
      throw error;
    } finally {
      this.abortController = undefined;
    }
  }

  private processToolCalls(
    state: StreamingState,
    toolCalls: DeltaToolCall[],
  ): boolean {
    let hasChanges = false;

    for (const toolCall of toolCalls) {
      const index = toolCall.index;
      if (!state.toolCallsMap.has(index)) {
        state.toolCallsMap.set(index, {
          id: toolCall.id !== undefined ? toolCall.id : "",
          type: "function",
          function: {
            name:
              toolCall.function?.name !== undefined
                ? toolCall.function.name
                : "",
            arguments: "",
          },
        });
        hasChanges = true;
      }

      const existingToolCall = state.toolCallsMap.get(index)!;
      if (toolCall.id !== undefined) {
        existingToolCall.id = toolCall.id;
        hasChanges = true;
      }
      if (toolCall.function?.name !== undefined) {
        existingToolCall.function.name = toolCall.function.name;
        hasChanges = true;
      }
      if (toolCall.function?.arguments !== undefined) {
        existingToolCall.function.arguments += toolCall.function.arguments;
        hasChanges = true;
      }
    }

    return hasChanges;
  }

  public abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
