<script setup lang="ts">
import type { UIMessage } from "@/engine/types/agent";

defineProps<{
  message: UIMessage & { kind: "user" };
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
