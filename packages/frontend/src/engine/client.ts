import { toolDefinitions } from "./tools";
import { APILLMResponseSchema } from "./types";
import type { APIMessage, APIResponse, OpenRouterConfig } from "./types";

export class LLMClient {
  constructor(private config: OpenRouterConfig) {}

  async callLLM(messages: APIMessage[]): Promise<APIResponse<APIMessage>> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        tools: toolDefinitions,
        messages,
      }),
    });

    if (!res.ok) {
      return {
        kind: "Error",
        error: `LLM API error: ${res.status} ${res.statusText}`,
      };
    }

    const data = await res.json();
    const response = APILLMResponseSchema.parse(data);
    if (response.choices === undefined || response.choices.length === 0) {
      return { kind: "Error", error: "No response from LLM" };
    }

    return { kind: "Success", data: response.choices[0]!.message };
  }
}
