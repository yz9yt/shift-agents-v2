import OpenAI from "openai";

import type { Agent } from "@/engine/agent/agent";
import {
  type APIMessage,
  type APIToolCall,
  type StreamChunk,
} from "@/engine/types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class LLMClient {
  private openai: OpenAI;
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
    const config = {
      apiKey: agent.config.openRouterConfig.apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/caido-community/shift-agents",
      },
      dangerouslyAllowBrowser: true,
    };
    this.openai = new OpenAI(config);
  }

  public async *streamText(
    messages: APIMessage[],
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const tools = this.agent.toolRegistry.getDefinitions();

    try {
      const stream = await this.openai.chat.completions.create({
        model: this.agent.config.openRouterConfig.model,
        messages,
        tools,
        stream: true,
        tool_choice: "auto",
      });

      const toolCallsMap = new Map<number, APIToolCall>();

      for await (const part of stream) {
        const choice = part.choices[0];
        if (!choice) continue;

        const delta = choice.delta;
        if (!delta) continue;

        if (delta.content) {
          yield {
            kind: "text",
            content: delta.content,
          };
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
            let updated = false;

            if (toolCall.id && !existingToolCall.id) {
              existingToolCall.id = toolCall.id;
              updated = true;
            }

            if (toolCall.function?.name && !existingToolCall.function.name) {
              existingToolCall.function.name = toolCall.function.name;
              updated = true;
            }

            if (toolCall.function?.arguments) {
              existingToolCall.function.arguments +=
                toolCall.function.arguments;
              updated = true;
            }

            if (updated) {
              yield {
                kind: "toolCall",
                id: existingToolCall.id,
                name: existingToolCall.function.name,
                arguments: existingToolCall.function.arguments,
                isComplete: false,
              };
            }
          }
        }

        if (choice.finish_reason === "tool_calls") {
          for (const [, toolCall] of toolCallsMap) {
            yield {
              kind: "toolCall",
              id: toolCall.id,
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
              isComplete: true,
            };
          }
        }
      }
    } catch (error) {
      console.error("OpenAI streaming error:", error);
      throw error;
    }
  }
}
