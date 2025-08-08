import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { models } from "./models";
import { defaultCustomPrompts } from "./prompts";

import type { CustomPrompt, ReasoningConfig } from "@/agents/types";
import { useSDK } from "@/plugins/sdk";
import { type PluginStorage } from "@/types";
import { SECRET_API_KEY } from "@/secrets";

export const useConfigStore = defineStore("stores.config", () => {
  const sdk = useSDK();

  const customPrompts = ref<CustomPrompt[]>(defaultCustomPrompts);
  const _openRouterApiKey = ref<string>(SECRET_API_KEY);
  const _model = ref<string>("openai/gpt-5-mini");
  const _maxIterations = ref<number>(25);
  const reasoningConfig = ref<ReasoningConfig>({
    enabled: true,
    max_tokens: 1500,
  });

  const openRouterApiKey = computed({
    get() {
      return _openRouterApiKey.value;
    },
    set(value: string) {
      _openRouterApiKey.value = value;
      saveSettings();
    },
  });

  const model = computed({
    get() {
      return _model.value;
    },
    set(value: string) {
      _model.value = value;
      saveSettings();
    },
  });

  const maxIterations = computed({
    get() {
      return _maxIterations.value;
    },
    set(value: number) {
      _maxIterations.value = value;
      saveSettings();
    },
  });

  const saveSettings = async () => {
    const settings: PluginStorage = {
      openRouterApiKey: _openRouterApiKey.value,
      model: _model.value,
      reasoningConfig: reasoningConfig.value,
      customPrompts: customPrompts.value,
      maxIterations: _maxIterations.value,
    };
    await sdk.storage.set(settings);
  };

  const loadSettings = () => {
    const settings = sdk.storage.get() as PluginStorage | undefined;
    if (settings) {
      if (settings.openRouterApiKey !== undefined) {
        _openRouterApiKey.value = settings.openRouterApiKey;
      }
      if (settings.model !== undefined) {
        _model.value = settings.model;
      }
      if (settings.reasoningConfig !== undefined) {
        reasoningConfig.value = settings.reasoningConfig;
      }
      if (settings.customPrompts !== undefined) {
        customPrompts.value = settings.customPrompts;
      }
      if (settings.maxIterations !== undefined) {
        _maxIterations.value = settings.maxIterations;
      }
    }
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
        _openRouterApiKey.value = settings.openRouterApiKey;
      }
      if (settings.model !== undefined) {
        _model.value = settings.model;
      }
      if (settings.reasoningConfig !== undefined) {
        reasoningConfig.value = settings.reasoningConfig;
      }
      if (settings.customPrompts !== undefined) {
        customPrompts.value = settings.customPrompts;
      }
      if (settings.maxIterations !== undefined) {
        _maxIterations.value = settings.maxIterations;
      }
    }
  });

  const selectedModel = computed(() => {
    return models
      .flatMap((group) => group.items)
      .find((item) => item.id === _model.value);
  });

  return {
    openRouterApiKey,
    maxIterations,
    model,
    models,
    reasoningConfig,
    selectedModel,
    setReasoningConfig,
    updateReasoningConfig,
    customPrompts,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
  };
});
