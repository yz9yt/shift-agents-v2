// modified by Albert.C Date 2025-08-22 Version 0.02
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { models } from "./models";
import { defaultCustomPrompts } from "./prompts";

import type {
  ControllerConfig,
  CustomPrompt,
  OrchestrationMode,
  OrchestrationModels,
  PluginStorage,
  ReasoningConfig,
  AutoModeConfig
} from "@/agents/types";
import { useSDK } from "@/plugins/sdk";

export const useConfigStore = defineStore("stores.config", () => {
  const sdk = useSDK();

  const customPrompts = ref<CustomPrompt[]>(defaultCustomPrompts);
  const _openRouterApiKey = ref<string>("");
  const _orchestrationMode = ref<OrchestrationMode>("Automatic");
  const _manualModelSequence = ref<string[]>([
    "anthropic/claude-sonnet-4",
    "anthropic/claude-sonnet-4",
    "anthropic/claude-sonnet-4",
    "anthropic/claude-sonnet-4",
    "anthropic/claude-sonnet-4",
  ]);
  const _maxIterations = ref<number>(35);
  const reasoningConfig = ref<ReasoningConfig>({
    enabled: true,
    max_tokens: 1500,
  });
  const controllerConfig = ref<ControllerConfig>({
    maxFailures: 10,
    throttleDelay: 500,
  });
  const autoModeConfig = ref<AutoModeConfig>({
    enabled: false
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

  const orchestrationMode = computed({
    get() {
      return _orchestrationMode.value;
    },
    set(value: OrchestrationMode) {
      _orchestrationMode.value = value;
      saveSettings();
    },
  });

  const manualModelSequence = computed({
    get() {
      return _manualModelSequence.value;
    },
    set(value: string[]) {
      _manualModelSequence.value = value;
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
      orchestrationMode: _orchestrationMode.value,
      manualModelSequence: _manualModelSequence.value,
      reasoningConfig: reasoningConfig.value,
      maxIterations: _maxIterations.value,
      customPrompts: customPrompts.value,
    };
    await sdk.storage.set(settings);
  };
  
  const loadSettings = () => {
    const settings = sdk.storage.get() as PluginStorage | undefined;
    if (settings) {
      if (settings.openRouterApiKey !== undefined) {
        _openRouterApiKey.value = settings.openRouterApiKey;
      }
      _orchestrationMode.value = settings.orchestrationMode ?? "Automatic";
      // Ensure manualModelSequence is always an array with at least one element
      if (settings.manualModelSequence && settings.manualModelSequence.length > 0) {
        _manualModelSequence.value = settings.manualModelSequence;
      } else {
        _manualModelSequence.value = ["anthropic/claude-sonnet-4"];
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
  
  const updateControllerConfig = async (updates: Partial<ControllerConfig>) => {
    controllerConfig.value = { ...controllerConfig.value, ...updates };
    await saveSettings();
  };

  const updateAutoModeConfig = async (updates: Partial<AutoModeConfig>) => {
    autoModeConfig.value = { ...autoModeConfig.value, ...updates };
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
      if (settings.orchestrationMode !== undefined) {
        _orchestrationMode.value = settings.orchestrationMode;
      }
      if (settings.manualModelSequence !== undefined) {
        _manualModelSequence.value = settings.manualModelSequence;
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
    // This now depends on the current orchestration mode
    let modelId;
    switch (_orchestrationMode.value) {
      case "Automatic":
        // Placeholder for future logic to select model automatically
        modelId = models
          .flatMap(group => group.items)
          .find(item => item.isRecommended)?.id;
        break;
      case "Economy":
        // Placeholder for future logic to select the cheapest model
        modelId = models
          .flatMap(group => group.items)
          .find(item => item.id.includes("lite"))?.id;
        break;
      case "Manual":
      default:
        modelId = _manualModelSequence.value[0];
        break;
    }

    return models
      .flatMap((group) => group.items)
      .find((item) => item.id === modelId);
  });

  const getOrchestrationModels = computed<OrchestrationModels>(() => {
    // Placeholder logic for now, will be updated later
    return {
      modelPhase1: _manualModelSequence.value[0],
      modelPhase2: _manualModelSequence.value[1],
      modelPhase3: _manualModelSequence.value[2],
      modelPhase4: _manualModelSequence.value[3],
      modelPhase5: _manualModelSequence.value[4],
    };
  });

  return {
    openRouterApiKey,
    maxIterations,
    orchestrationMode,
    manualModelSequence,
    models,
    reasoningConfig,
    controllerConfig,
    autoModeConfig,
    selectedModel,
    getOrchestrationModels,
    setReasoningConfig,
    updateReasoningConfig,
    updateControllerConfig,
    updateAutoModeConfig,
    customPrompts,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
  };
});
