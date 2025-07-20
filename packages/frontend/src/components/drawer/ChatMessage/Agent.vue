<script setup lang="ts">
import type { FrontendMessage } from "@/engine/types";
import { computed } from "vue";

const props = defineProps<{
  message: FrontendMessage;
}>();

const content = computed(() => {
  return props.message.content?.trim() ?? "";
});
</script>

<template>
  <div
    class="p-2 text-surface-200 whitespace-pre-wrap break-words font-mono select-text"
    v-if="content.length > 0"
  >
    {{ content }}
  </div>
</template>
