<script setup lang="ts">
import { ref, watch } from "vue";
import type { UIMessage } from "@/engine/types/agent";

const props = defineProps<{
  message: UIMessage & { kind: "assistant" };
}>();

const showReasoning = ref(true);

watch(
  () => props.message.content,
  (newContent) => {
    if (newContent && newContent.trim() && showReasoning.value) {
      showReasoning.value = false;
    }
  }
);
</script>

<template>
  <div>
    <div v-if="message.reasoning" class="py-1 px-2">
      <button
        @click="showReasoning = !showReasoning"
        class="flex items-center gap-2 text-surface-400 hover:text-surface-300 text-sm transition-colors font-mono"
      >
        <i
          class="fas transition-transform"
          :class="showReasoning ? 'fa-chevron-down' : 'fa-chevron-right'"
        ></i>
        <span>Reasoning</span>
      </button>

      <div
        v-if="showReasoning"
        class="mt-2 p-3 bg-surface-900 border border-surface-700 rounded text-surface-300 whitespace-pre-wrap break-words font-mono text-sm select-text"
      >
        {{ message.reasoning }}
      </div>
    </div>
    <div
      class="text-surface-200 whitespace-pre-wrap break-words font-mono select-text"
      :class="{ 'py-1 px-2': message.content }"
    >
      {{ message.content }}
    </div>
  </div>
</template>
