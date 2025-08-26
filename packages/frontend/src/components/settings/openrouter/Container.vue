// modified by Albert.C Date 2025-08-22 Version 0.02
<script setup lang="ts">
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import { ref, computed } from "vue";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import SelectButton from 'primevue/selectbutton';


import { useForm } from "./useForm";

import { useConfigStore } from "@/stores/config";
import type { ModelItem } from "@/agents/types/config";

const {
  isApiKeyVisible,
  isValidating,
  toggleApiKeyVisibility,
  validateApiKey,
} = useForm();

const config = useConfigStore();

const isRecommendedModel = (modelId: string): boolean => {
  const model = config.models.flatMap(group => group.items).find(item => item.id === modelId);
  return model?.isRecommended ?? false;
};

const allModels = config.models.flatMap(group => group.items);

const orchestrationModes = [
  { name: 'Automatic', value: 'Automatic' },
  { name: 'Economy', value: 'Economy' },
  { name: 'Manual', value: 'Manual' }
];

const selectedModel = computed(() => {
  if (config.orchestrationMode === 'Manual') {
    return allModels.find(m => m.id === config.manualModelSequence[0]);
  }
  return null;
});

const getModelNameById = (id: string) => {
  return allModels.find(m => m.id === id)?.name;
};
</script>

<template>
  <div class="flex flex-col gap-8 p-4">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h4 class="text-md font-medium text-surface-300">General Settings</h4>
        <p class="text-sm text-surface-400">
          Here you can configure general settings like your OpenRouter API key
          to get started with AI model access.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <label class="text-sm font-medium">API Key</label>
          <p class="text-xs text-surface-400">
            Enter your OpenRouter API key to enable AI model access
          </p>
        </div>

        <div class="flex gap-3">
          <IconField class="flex-1">
            <InputIcon class="fas fa-key" />
            <InputText
              v-model="config.openRouterApiKey"
              :type="isApiKeyVisible ? 'text' : 'password'"
              placeholder="Enter API key"
              class="w-full"
            />
          </IconField>
          <Button
            :icon="isApiKeyVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"
            severity="secondary"
            outlined
            @click="toggleApiKeyVisibility"
          />
          <Button
            icon="fas fa-check-circle"
            label="Validate"
            :disabled="!config.openRouterApiKey?.trim()"
            :loading="isValidating"
            @click="validateApiKey"
          />
        </div>
      </div>
      
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <label class="text-sm font-medium">Model Orchestration Mode</label>
          <p class="text-xs text-surface-400">
            Choose a mode to select models for the agent's workflow.
          </p>
        </div>
        <SelectButton v-model="config.orchestrationMode" :options="orchestrationModes" optionLabel="name" optionValue="value" />
        
        <div v-if="config.orchestrationMode === 'Manual'" class="flex flex-col gap-2 mt-2">
          <div class="flex flex-col">
            <label class="text-sm font-medium">Manual Model Sequence</label>
            <p class="text-xs text-surface-400">
              Define a sequence of up to 5 models for the agent to use.
            </p>
          </div>
          <div v-for="(modelId, index) in config.manualModelSequence" :key="index" class="flex items-center gap-2">
            <span class="text-sm text-surface-300">{{ index + 1 }}.</span>
            <Dropdown v-model="config.manualModelSequence[index]" :options="allModels" optionLabel="name" optionValue="id" class="w-full" />
            <Button v-if="config.manualModelSequence.length > 2" icon="fas fa-trash" severity="danger" outlined @click="config.manualModelSequence.splice(index, 1)" />
          </div>
          <Button v-if="config.manualModelSequence.length < 5" label="Add Model" icon="fas fa-plus" severity="secondary" outlined @click="config.manualModelSequence.push(allModels[0].id)" />
        </div>

        <div v-if="config.orchestrationMode === 'Manual' && config.manualModelSequence.some(id => !isRecommendedModel(id))" class="text-sm text-red-400 mt-2">
          Warning: Using non-recommended models may lead to unexpected behavior or malformed responses.
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <label class="text-sm font-medium">Request Throttle Delay (ms)</label>
          <p class="text-xs text-surface-400">
            Sets a delay between each API call to prevent a rapid burst of requests.
          </p>
        </div>
        <InputNumber v-model="config.controllerConfig.throttleDelay" :min="0" class="w-full" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <label class="text-sm font-medium">Max Consecutive Failures</label>
          <p class="text-xs text-surface-400">
            The number of consecutive API errors after which the agent will stop automatically.
          </p>
        </div>
        <InputNumber v-model="config.controllerConfig.maxFailures" :min="1" class="w-full" />
      </div>
      <div class="flex flex-col gap-2 mt-4">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <label class="text-sm font-medium">Enable Reasoning</label>
            <p class="text-xs text-surface-400">
              Allows the agent to generate thoughts and plans before acting.
            </p>
          </div>
          <Checkbox v-model="config.reasoningConfig.enabled" binary @change="config.updateReasoningConfig({ enabled: config.reasoningConfig.enabled })" />
        </div>
        
        <div class="flex flex-col gap-2" v-if="config.reasoningConfig.enabled">
            <label class="text-sm font-medium">Max Reasoning Tokens</label>
            <InputNumber v-model="config.reasoningConfig.max_tokens" :min="100" class="w-full" @update:modelValue="config.updateReasoningConfig({ max_tokens: config.reasoningConfig.max_tokens })" />
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex flex-col">
            <label class="text-sm font-medium">Enable Auto Mode</label>
            <p class="text-xs text-surface-400">
              The agent will autonomously perform a security assessment.
            </p>
          </div>
          <Checkbox v-model="config.autoModeConfig.enabled" binary @change="config.updateAutoModeConfig({ enabled: config.autoModeConfig.enabled })" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <label class="text-sm font-medium">Max Iterations</label>
          <p class="text-xs text-surface-400">
            Enter the maximum number of iterations for AI model.
          </p>
        </div>

        <div class="flex gap-3">
          <InputNumber
            v-model="config.maxIterations"
            placeholder="Enter max iterations"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>
