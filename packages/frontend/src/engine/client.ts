import type { Agent } from "@/engine/agent";
import { toolDefinitions } from "@/engine/tools";
import {
  type APIMessage,
  type APIToolCall,
  type StreamChunk,
} from "@/engine/types/agent";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class LLMClient {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  public async *streamText(
    messages: APIMessage[]
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const requestBody = {
        model: this.agent.config.openRouterConfig.model,
        messages: messages,
        tools: toolDefinitions,
        stream: true,
      };

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.agent.config.openRouterConfig.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const toolCallsMap = new Map<number, APIToolCall>();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);

            if (dataStr.trim() === "[DONE]") {
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

                if (delta.tool_calls !== undefined) {
                  for (const toolCall of delta.tool_calls) {
                    const index = toolCall.index;
                    if (!toolCallsMap.has(index)) {
                      toolCallsMap.set(index, {
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
                    }

                    const existingToolCall = toolCallsMap.get(index)!;
                    if (toolCall.id !== undefined) {
                      existingToolCall.id = toolCall.id;
                    }
                    if (toolCall.function?.name !== undefined) {
                      existingToolCall.function.name = toolCall.function.name;
                    }
                    if (toolCall.function?.arguments !== undefined) {
                      existingToolCall.function.arguments +=
                        toolCall.function.arguments;
                    }
                  }
                }
              }

              const finishReason = data.choices?.[0]?.finish_reason;

              if (finishReason === "tool_calls") {
                const toolCalls = Array.from(toolCallsMap.values());
                yield {
                  kind: "toolCall",
                  toolCalls,
                };
                toolCallsMap.clear();
                break;
              } else if (finishReason === "stop") {
                break;
              }
            } catch (parseError) {
              console.warn(
                "Failed to parse streaming data:",
                parseError,
                "Raw data:",
                dataStr
              );
              continue;
            }
          }
        }
      }

      if (toolCallsMap.size > 0) {
        const toolCalls = Array.from(toolCallsMap.values());
        yield {
          kind: "toolCall",
          toolCalls,
        };
      }
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }
}
