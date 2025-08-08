import { ModelGroup } from "@/agents/types";

export const models: ModelGroup[] = [
  {
    label: "Claude",
    items: [
      {
        name: "Claude 4 Sonnet",
        id: "anthropic/claude-sonnet-4",
        isReasoningModel: true,
        isRecommended: true,
      },
      {
        name: "Claude 3.7 Sonnet",
        isRecommended: true,
        id: "anthropic/claude-3.7-sonnet",
        isReasoningModel: true,
      },
      {
        name: "Claude 3.5 Sonnet",
        isRecommended: true,
        id: "anthropic/claude-3.5-sonnet",
      },
    ],
  },
  {
    label: "GPT",
    items: [
      {
        name: "GPT 4.1",
        isRecommended: true,
        id: "openai/gpt-4.1",
      },
      {
        name: "GPT 5 Mini",
        isRecommended: true,
        id: "openai/gpt-5-mini",
      },
    ],
  },
  {
    label: "Gemini",
    items: [
      {
        name: "Gemini 2.5 Pro",
        isReasoningModel: true,
        id: "google/gemini-2.5-pro",
      },
      {
        name: "Gemini 2.5 Flash",
        id: "google/gemini-2.5-flash",
        isReasoningModel: true,
      },
      {
        name: "Gemini 2.5 Flash Lite",
        id: "google/gemini-2.5-flash-lite",
        isRecommended: true,
      },
    ],
  },
  {
    label: "DeepSeek",
    items: [
      {
        name: "DeepSeek R1",
        isReasoningModel: true,
        isRecommended: true,
        id: "deepseek/deepseek-r1-0528",
      },
    ],
  },
  {
    label: "Moonshot",
    items: [
      {
        name: "Kimi K2",
        isReasoningModel: true,
        isRecommended: true,
        id: "moonshotai/kimi-k2",
      },
    ],
  },
];
