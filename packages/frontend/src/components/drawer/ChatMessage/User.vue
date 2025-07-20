<script setup lang="ts">
import type { FrontendMessage } from "@/engine/types";

defineProps<{
  message: FrontendMessage;
}>();
</script>

<template>
  <div
    class="p-3 rounded-lg bg-surface-900 ml-auto shadow-lg shadow-surface-800 w-full select-text"
  >
    <div
      class="text-surface-200 whitespace-pre-wrap break-words font-mono text-sm"
    >
      {{ message.content }}
    </div>
  </div>
</template>
