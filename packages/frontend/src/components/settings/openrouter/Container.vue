<script setup lang="ts">
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";

import { useForm } from "./useForm";

const {
  localApiKey,
  isApiKeyVisible,
  isValidating,
  updateApiKey,
  toggleApiKeyVisibility,
  validateApiKey,
} = useForm();
</script>

<template>
  <div class="flex flex-col gap-8 p-4">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h4 class="text-md font-medium text-surface-300">
          OpenRouter Settings
        </h4>
        <p class="text-sm text-surface-400">
          Currently, we only support OpenRouter as the AI provider. Configure
          your API key below to get started.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">API Key</label>
          <p class="text-xs text-surface-400">
            Enter your OpenRouter API key to enable AI model access
          </p>
        </div>

        <div class="flex gap-3">
          <IconField class="flex-1">
            <InputIcon class="fas fa-key" />
            <InputText
              v-model="localApiKey"
              :type="isApiKeyVisible ? 'text' : 'password'"
              placeholder="Enter API key"
              class="w-full"
              @blur="updateApiKey"
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
            :disabled="!localApiKey?.trim()"
            :loading="isValidating"
            @click="validateApiKey"
          />
        </div>
      </div>
    </div>
  </div>
</template>
