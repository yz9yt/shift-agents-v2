<script setup lang="ts">
import { useToolMessage } from "./useMessage";

import type { UIMessage } from "@/engine/types/agent";

const props = defineProps<{
  message: UIMessage & { kind: "tool" };
}>();

const {
  showDetails,
  isProcessing,
  formatToolCalls,
  toolDetails,
  toolIcon,
  toggleDetails,
} = useToolMessage(props);
</script>

<template>
  <div class="flex flex-col gap-2 text-surface-300 px-2">
    <div class="flex items-center gap-2 hover:text-surface-200">
      <i :class="toolIcon" class="text-sm w-4 text-left" />
      <span
        class="text-sm font-mono font-thin flex items-center gap-1 justify-between w-full overflow-hidden text-ellipsis text-nowrap"
        :class="[
          toolDetails ? 'cursor-pointer' : '',
          isProcessing ? 'shimmer' : '',
        ]"
        @click="toggleDetails"
      >
        {{ formatToolCalls }}
        <i
          v-if="toolDetails"
          class="text-sm w-4"
          :class="showDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
        />
      </span>
    </div>

    <div v-if="showDetails && toolDetails" class="w-full">
      <pre class="text-xs text-surface-300 font-mono whitespace-pre-wrap">{{
        toolDetails
      }}</pre>
    </div>
  </div>
</template>

<style scoped>
.shimmer {
  display: inline-block;
  color: white;
  background: #acacac linear-gradient(to left, #acacac, #ffffff 50%, #acacac);
  background-position: -4rem top;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: shimmer 2.2s infinite;
  animation: shimmer 2.2s infinite;
  background-size: 4rem 100%;
}

@-webkit-keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 12rem top;
  }
  100% {
    background-position: 12rem top;
  }
}

@keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 12rem top;
  }
  100% {
    background-position: 12rem top;
  }
}
</style>
