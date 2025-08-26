// modified by Albert.C Date 2025-08-22 Version 0.03
<script setup lang="ts">
import { useErrorLogStore } from "@/stores/errorLog";

const errorLogStore = useErrorLogStore();
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto p-4 gap-2 text-sm">
    <div v-if="errorLogStore.errors.length === 0" class="flex flex-col items-center justify-center h-full text-center text-surface-400">
      <i class="fas fa-check-circle text-4xl mb-2"></i>
      <div>No errors logged yet.</div>
    </div>
    <div v-for="(error, index) in errorLogStore.errors" :key="index" class="bg-surface-800 p-3 rounded-md border border-surface-700">
      <div class="flex items-center gap-2 text-red-400">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Error in {{ error.agentId }}</span>
      </div>
      <div class="text-surface-300 font-mono mt-1 whitespace-pre-wrap">
        {{ error.message }}
      </div>
      <div class="text-xs text-surface-500 mt-1">
        {{ new Date(error.timestamp).toLocaleString() }}
      </div>
    </div>
  </div>
</template>
