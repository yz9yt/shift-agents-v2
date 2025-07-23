import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { ModelGroup, ReasoningConfig } from "@/engine/types/config";
import { SECRET_API_KEY } from "@/secrets";

export const useConfigStore = defineStore("stores.config", () => {
  const openRouterApiKey = ref<string>(SECRET_API_KEY);
  const model = ref<string>("openai/gpt-4.1");
  const reasoningConfig = ref<ReasoningConfig>({
    enabled: true,
    max_tokens: 1500,
  });

  const models = ref<ModelGroup[]>([
    {
      label: "Claude",
      items: [
        {
          name: "Claude 4 Sonnet",
          id: "anthropic/claude-sonnet-4",
          reasoningModel: true,
        },
        {
          name: "Claude 3.7 Sonnet",
          isRecommended: true,
          id: "anthropic/claude-3.7-sonnet",
          reasoningModel: true,
        },
        {
          name: "Claude 3.5 Sonnet",
          isRecommended: true,
          id: "anthropic/claude-3.5-sonnet",
        },
      ],
    },
    {
      label: "Gemini",
      items: [
        {
          name: "Gemini 2.5 Pro",
          isRecommended: true,
          id: "google/gemini-2.5-pro",
        },
        {
          name: "Gemini 2.5 Flash",
          id: "google/gemini-2.5-flash",
          reasoningModel: true,
        },
        {
          name: "Gemini 2.5 Flash Lite",
          id: "google/gemini-2.5-flash-lite",
        },
        { name: "Gemini 2.0 Flash", id: "google/gemini-2.0-flash-001" },
        {
          name: "Gemini 2.0 Flash Lite",
          id: "google/gemini-2.0-flash-lite-001",
        },
      ],
    },
    {
      label: "GPT",
      items: [
        { name: "GPT 4.1", isRecommended: true, id: "openai/gpt-4.1" },
        {
          name: "GPT o4 Mini High",
          id: "openai/o4-mini-high",
          reasoningModel: true,
        },
      ],
    },
    {
      label: "DeepSeek",
      items: [
        {
          name: "DeepSeek R1",
          reasoningModel: true,
          isRecommended: true,
          id: "deepseek/deepseek-r1-0528",
        },
      ],
    },
  ]);

  const setOpenRouterApiKey = (key: string) => {
    openRouterApiKey.value = key;
  };

  const setModel = (newModel: string) => {
    model.value = newModel;
  };

  const setReasoningConfig = (config: ReasoningConfig) => {
    reasoningConfig.value = config;
  };

  const updateReasoningConfig = (updates: Partial<ReasoningConfig>) => {
    reasoningConfig.value = { ...reasoningConfig.value, ...updates };
  };

  const selectedModel = computed(() => {
    return models.value
      .flatMap((group) => group.items)
      .find((item) => item.id === model.value);
  });

  return {
    openRouterApiKey,
    model,
    models,
    reasoningConfig,
    selectedModel,
    setOpenRouterApiKey,
    setModel,
    setReasoningConfig,
    updateReasoningConfig,
  };
});
