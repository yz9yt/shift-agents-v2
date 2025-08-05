<script setup lang="ts">
import { useAgentMessage } from "./useMessage";

import type { UIMessage } from "@/engine/types/agent";

const props = defineProps<{
  message: UIMessage & { kind: "assistant" };
}>();

const { showReasoning, reasoningText, renderedMarkdown, toggleReasoning } =
  useAgentMessage(props);
</script>

<template>
  <div class="px-2">
    <div v-if="message.reasoning !== undefined" class="py-1">
      <button
        class="flex items-center gap-2 text-surface-300 hover:text-surface-200 text-sm transition-colors font-mono"
        @click="toggleReasoning"
      >
        <i
          class="fas transition-transform text-sm w-4 text-left"
          :class="showReasoning ? 'fa-chevron-down' : 'fa-chevron-right'"
        ></i>
        <span
          :class="{
            shimmer:
              message.reasoning !== undefined &&
              message.reasoningCompleted !== true,
          }"
          >{{ reasoningText }}</span
        >
      </button>

      <div
        v-if="showReasoning"
        class="mt-2 p-3 bg-surface-900 border border-surface-700 rounded text-surface-300 whitespace-pre-wrap break-words text-sm select-text font-mono"
      >
        {{ message.reasoning }}
      </div>
    </div>
    <div
      v-if="message.content !== undefined && message.content.length > 0"
      class="text-surface-200 break-words select-text font-mono prose dark:prose-invert markdown-content"
      v-html="renderedMarkdown"
    ></div>
  </div>
</template>

<style scoped>
.markdown-content * {
  margin: 0.2rem 0;
}

.shimmer {
  display: inline-block;
  color: white;
  background: #acacac linear-gradient(to left, #acacac, #ffffff 50%, #acacac);
  background-position: -4rem top;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: shimmer 1.2s infinite;
  animation: shimmer 1.2s infinite;
  background-size: 4rem 100%;
}

@-webkit-keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 6rem top;
  }
  100% {
    background-position: 6rem top;
  }
}

@keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 6rem top;
  }
  100% {
    background-position: 6rem top;
  }
}
</style>
