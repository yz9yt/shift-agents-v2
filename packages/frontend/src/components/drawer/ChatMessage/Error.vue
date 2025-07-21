<script setup lang="ts">
import type { UIMessage } from "@/engine/types/agent";

defineProps<{
  message: UIMessage & { kind: "error" };
}>();
</script>

<template>
  <div class="p-3 text-red-500 bg-surface-900 shadow-lg shadow-surface-800">
    <h3 class="font-semibold mb-2">Error occurred</h3>
    <pre
      class="text-sm bg-surface-800 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap font-mono select-text"
      >{{ message.content }}</pre
    >
  </div>
</template>
