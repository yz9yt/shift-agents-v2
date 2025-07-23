import { defineStore } from "pinia";
import { ref } from "vue";
import type { ReasoningConfig } from "@/engine/types/config";

export const useConfigStore = defineStore("stores.config", () => {
  const openRouterApiKey = ref<string>("");
  const reasoningConfig = ref<ReasoningConfig>({
    max_tokens: 2000,
  });

  const setOpenRouterApiKey = (key: string) => {
    openRouterApiKey.value = key;
  };

  const setReasoningConfig = (config: ReasoningConfig) => {
    reasoningConfig.value = config;
  };

  const updateReasoningConfig = (updates: Partial<ReasoningConfig>) => {
    reasoningConfig.value = { ...reasoningConfig.value, ...updates };
  };

  return {
    openRouterApiKey,
    reasoningConfig,
    setOpenRouterApiKey,
    setReasoningConfig,
    updateReasoningConfig,
  };
});
