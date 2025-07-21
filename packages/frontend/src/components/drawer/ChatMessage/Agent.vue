<script setup lang="ts">
import { computed } from "vue";

import type { UIMessage } from "@/engine/types/agent";

const props = defineProps<{
  message: UIMessage & { kind: "assistant" };
}>();

const content = computed(() => {
  return props.message.content?.trim() ?? "";
});
</script>

<template>
  <div
    v-if="content.length > 0"
    class="p-2 text-surface-200 whitespace-pre-wrap break-words font-mono select-text"
  >
    {{ content }}
  </div>
</template>
