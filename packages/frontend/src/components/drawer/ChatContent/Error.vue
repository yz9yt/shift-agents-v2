<script setup lang="ts">
import { useContent } from "./useContent";

import { useAgentsStore } from "@/stores/agents";

const { error } = useContent();
const agentsStore = useAgentsStore();

const restart = () => {
  agentsStore.selectedAgent?.clearError();
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-center h-full text-center px-4"
  >
    <i class="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
    <h3 class="text-lg font-semibold text-surface-200">Error Occurred</h3>
    <span v-if="error?.message && error.message.includes('Too many consecutive API failures')"
          class="text-surface-400 text-sm whitespace-pre-wrap select-text py-2">
      The agent stopped automatically due to too many failed attempts to connect to the API. Please check your OpenRouter API key and network connection.
    </span>
    <span v-else class="text-surface-400 text-sm whitespace-pre-wrap select-text py-2">
      {{ error }}
    </span>
    <button
      class="mt-4 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-lg text-sm"
      @click="restart"
    >
      Clear Error
    </button>
  </div>
</template>
