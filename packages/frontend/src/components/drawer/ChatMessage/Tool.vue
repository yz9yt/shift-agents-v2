<script setup lang="ts">
import type { FrontendMessage } from "@/engine/types";
import { computed, ref } from "vue";
import { toRefs } from "vue";

const props = defineProps<{
  message: FrontendMessage;
}>();

const { message } = toRefs(props);

const showDetails = ref(false);

const toolCall = computed(() => message.value.tool_call);

const isProcessing = computed(() => toolCall.value?.kind === "processing");

const formatToolCalls = computed(() => {
  const call = toolCall.value;
  if (call?.kind === "success" || call?.kind === "processing") {
    return call.frontend.message;
  }
  return undefined;
});

const toolDetails = computed(() => {
  const call = toolCall.value;
  if (call?.kind === "success") {
    return call.frontend.details;
  }
  return undefined;
});

const toolIcon = computed(() => {
  const call = toolCall.value;
  if (call?.kind === "success" || call?.kind === "processing") {
    return call.frontend.icon;
  }
  return "fas fa-exclamation-triangle";
});
</script>

<template>
  <div v-if="toolCall" class="flex flex-col gap-2 text-surface-300 px-2">
    <div class="flex items-center gap-2">
      <i :class="toolIcon" class="text-sm" />
      <span
        class="text-sm font-mono font-thin flex items-center gap-1 justify-between w-full"
        :class="[
          toolDetails
            ? 'cursor-pointer hover:text-surface-200'
            : '',
          isProcessing ? 'shimmer' : '',
        ]"
        @click="toolDetails && (showDetails = !showDetails)"
      >
        {{ formatToolCalls }}
        <i
          v-if="toolDetails"
          class="text-sm"
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
    background-position: 6.5rem top;
  }
  100% {
    background-position: 6.5rem top;
  }
}

@keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 6.5rem top;
  }
  100% {
    background-position: 6.5rem top;
  }
}
</style>
