// modified by Albert.C Date 2025-08-22 Version 0.01
import { type ModelGroup } from "@/agents/types";

export const models: ModelGroup[] = [
  {
    label: "Anthropic",
    items: [
      {
        name: "Claude Opus 4.1",
        id: "anthropic/claude-opus-4.1",
        isReasoningModel: true,
        isRecommended: true,
      },
      {
        name: "Claude Sonnet 4",
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
    label: "Google",
    items: [
      {
        name: "Gemini 2.5 Pro",
        isReasoningModel: true,
        isRecommended: true,
        id: "google/gemini-2.5-pro",
      },
      {
        name: "Gemini 2.5 Flash",
        id: "google/gemini-2.5-flash",
        isReasoningModel: true,
        isRecommended: true,
      },
      {
        name: "Gemini 2.5 Flash Lite",
        id: "google/gemini-2.5-flash-lite",
        isRecommended: true,
      },
      {
        name: "Gemini 2.5 Flash Lite Preview 06-17",
        id: "google/gemini-2.5-flash-lite-preview-06-17",
      },
      {
        name: "Gemini 2.0 Flash",
        id: "google/gemini-2.0-flash",
      }
    ],
  },
  {
    label: "OpenAI",
    items: [
      {
        name: "GPT-5",
        id: "openai/gpt-5",
        isReasoningModel: true,
      },
      {
        name: "GPT-4.1",
        id: "openai/gpt-4.1",
        isReasoningModel: true,
        isRecommended: true,
      },
      {
        name: "GPT-4o-mini",
        id: "openai/gpt-4o-mini",
      },
      {
        name: "GPT-5 Mini",
        id: "openai/gpt-5-mini",
        isReasoningModel: true,
      },
      {
        name: "GPT OOS 120B",
        id: "openai/gpt-oss-120b",
      },
    ],
  },
  {
    label: "DeepSeek",
    items: [
      {
        name: "DeepSeek V3 0324",
        id: "deepseek/deepseek-v3-0324",
        isRecommended: true,
      },
      {
        name: "R1 0528 (free)",
        isReasoningModel: true,
        isRecommended: true,
        id: "deepseek/deepseek-r1-0528",
      },
      {
        name: "DeepSeek V3 0324 (free)",
        id: "deepseek/deepseek-v3-0324-free",
      },
      {
        name: "R1 (free)",
        id: "deepseek/deepseek-r1-free",
      }
    ],
  },
  {
    label: "Qwen",
    items: [
      {
        name: "Qwen3 Coder",
        id: "qwen/qwen3-coder",
        isRecommended: true,
      },
      {
        name: "Qwen3 Coder (free)",
        id: "qwen/qwen3-coder-free",
      },
      {
        name: "Qwen3 32B",
        id: "qwen/qwen3-32b",
      }
    ],
  },
  {
    label: "Other",
    items: [
      {
        name: "Grok 4",
        id: "grok/grok-4",
      },
      {
        name: "Mistral Nemo",
        id: "mistral/nemo",
      },
      {
        name: "Kimi K2",
        id: "moonshotai/kimi-k2",
      },
      {
        name: "GLM 4.5",
        id: "glm/glm-4.5",
      }
    ],
  },
];
