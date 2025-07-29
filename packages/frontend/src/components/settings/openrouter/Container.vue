<script setup lang="ts">
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";

import { useForm } from "./useForm";

import { useConfigStore } from "@/stores/config";

const {
  isApiKeyVisible,
  isValidating,
  toggleApiKeyVisibility,
  validateApiKey,
} = useForm();

const config = useConfigStore();
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
