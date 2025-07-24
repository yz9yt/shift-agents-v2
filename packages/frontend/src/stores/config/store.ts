import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { models } from "./models";
import { defaultCustomPrompts } from "./prompts";

import type { CustomPrompt, ReasoningConfig } from "@/engine/types/config";
import { useSDK } from "@/plugins/sdk";
import { PluginStorage } from "@/types";

export const useConfigStore = defineStore("stores.config", () => {
  const sdk = useSDK();

  const customPrompts = ref<CustomPrompt[]>(defaultCustomPrompts);
  const openRouterApiKey = ref<string>("");
  const model = ref<string>("anthropic/claude-sonnet-4");
  const reasoningConfig = ref<ReasoningConfig>({
    enabled: true,
    max_tokens: 1500,
  });

  const saveSettings = async () => {
    const settings: PluginStorage = {
      openRouterApiKey: openRouterApiKey.value,
      model: model.value,
      reasoningConfig: reasoningConfig.value,
      customPrompts: customPrompts.value,
    };
    await sdk.storage.set(settings);
  };

  const loadSettings = () => {
    const settings = sdk.storage.get() as PluginStorage | undefined;
    if (settings) {
      if (settings.openRouterApiKey !== undefined) {
        openRouterApiKey.value = settings.openRouterApiKey;
      }
      if (settings.model !== undefined) {
        model.value = settings.model;
      }
      if (settings.reasoningConfig !== undefined) {
        reasoningConfig.value = settings.reasoningConfig;
      }
      if (settings.customPrompts !== undefined) {
        customPrompts.value = settings.customPrompts;
      }
    }
  };

  const setOpenRouterApiKey = async (key: string) => {
    openRouterApiKey.value = key;
    await saveSettings();
  };

  const setModel = async (newModel: string) => {
    model.value = newModel;
    await saveSettings();
  };

  const setReasoningConfig = async (config: ReasoningConfig) => {
    reasoningConfig.value = config;
    await saveSettings();
  };

  const updateReasoningConfig = async (updates: Partial<ReasoningConfig>) => {
    reasoningConfig.value = { ...reasoningConfig.value, ...updates };
    await saveSettings();
  };

  const addCustomPrompt = async (prompt: CustomPrompt) => {
    customPrompts.value.push(prompt);
    await saveSettings();
  };

  const updateCustomPrompt = async (prompt: CustomPrompt) => {
    const index = customPrompts.value.findIndex((p) => p.id === prompt.id);
    if (index !== -1) {
      customPrompts.value[index] = prompt;
      await saveSettings();
    }
  };

  const deleteCustomPrompt = async (id: string) => {
    customPrompts.value = customPrompts.value.filter((p) => p.id !== id);
    await saveSettings();
  };

  loadSettings();

  sdk.storage.onChange((newSettings) => {
    const settings = newSettings as PluginStorage | undefined;
    if (settings) {
      if (settings.openRouterApiKey !== undefined) {
        openRouterApiKey.value = settings.openRouterApiKey;
      }
      if (settings.model !== undefined) {
        model.value = settings.model;
      }
      if (settings.reasoningConfig !== undefined) {
        reasoningConfig.value = settings.reasoningConfig;
      }
      if (settings.customPrompts !== undefined) {
        customPrompts.value = settings.customPrompts;
      }
    }
  });

  const selectedModel = computed(() => {
    return models
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
    customPrompts,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
  };
});
