<script setup lang="ts">
import { toRefs } from "vue";

import { useUserMessage } from "./useMessage";

import type { UIMessage } from "@/engine/types/agent";

const props = defineProps<{
  message: UIMessage & { kind: "user" };
}>();

const { message } = toRefs(props);

const { isGenerating, handleMessageClick } = useUserMessage(props);
</script>

<template>
  <div
    class="p-3 rounded-lg bg-surface-900 ml-auto shadow-lg shadow-surface-800 w-full select-text group relative border border-surface-700 hover:border-secondary-400 transition-colors"
  >
    <div
      class="text-surface-200 whitespace-pre-wrap break-words font-mono text-sm cursor-pointer rounded p-1 -m-1"
      :class="{ 'opacity-80': isGenerating }"
      @dblclick="handleMessageClick"
    >
      {{ message.content }}
    </div>
  </div>
</template>
