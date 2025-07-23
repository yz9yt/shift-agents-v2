<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed, ref, watch } from "vue";

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

const md = new MarkdownIt({
  breaks: true,
  linkify: false,
});

const renderedMarkdown = computed(() => md.render(props.message.content));
</script>

<template>
  <div id="agent-message">
    <div v-if="message.reasoning" class="py-1 px-2">
      <button
        class="flex items-center gap-2 text-surface-400 hover:text-surface-300 text-sm transition-colors font-mono"
        @click="showReasoning = !showReasoning"
      >
        <i
          class="fas transition-transform"
          :class="showReasoning ? 'fa-chevron-down' : 'fa-chevron-right'"
        ></i>
        <span>Reasoning</span>
      </button>

      <div
        v-if="showReasoning"
        class="mt-2 p-3 bg-surface-900 border border-surface-700 rounded text-surface-300 whitespace-pre-wrap break-words text-sm select-text font-mono"
        v-html="message.reasoning"
      ></div>
    </div>
    <div
      class="text-surface-200 break-words select-text font-mono prose dark:prose-invert markdown-content"
      :class="{ 'py-1 px-2': message.content }"
      v-html="renderedMarkdown"
    ></div>
  </div>
</template>

<style scoped>
.markdown-content * {
  margin: 0.2rem 0;
}
</style>
