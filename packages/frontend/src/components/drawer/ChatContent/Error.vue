<script setup lang="ts">
import { useAgentsStore } from "@/stores/agents";
import { useContent } from "./useContent";

const { error } = useContent();
const agentsStore = useAgentsStore();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center h-full text-center px-4"
  >
    <i class="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
    <h3 class="text-lg font-semibold text-surface-200">Error Occurred</h3>
    <pre class="text-surface-400 text-sm whitespace-pre-wrap select-text py-2">
      {{ error }}
    </pre>

    <pre class="max-h-64 overflow-y-auto">{{ agentsStore.selectedAgent }}</pre>
  </div>
</template>
