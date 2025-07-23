<script setup lang="ts">
import { computed, ref, toRefs } from "vue";

import type { UIMessage } from "@/engine/types/agent";

const props = defineProps<{
  message: UIMessage & { kind: "tool" };
}>();

const { message } = toRefs(props);

const showDetails = ref(false);

const isProcessing = computed(() => message.value.status === "processing");

const formatToolCalls = computed(() => {
  return message.value.metadata.message;
});

const toolDetails = computed(() => {
  return message.value.metadata.details;
});

const toolIcon = computed(() => {
  return message.value.metadata.icon;
});
</script>

<template>
  <div class="flex flex-col gap-2 text-surface-300 px-2">
    <div class="flex items-center gap-2">
      <i :class="toolIcon" class="text-sm" />
      <span
        class="text-sm font-mono font-thin flex items-center gap-1 justify-between w-full overflow-hidden text-ellipsis"
        :class="[
          toolDetails ? 'cursor-pointer hover:text-surface-200' : '',
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
    background-position: 10rem top;
  }
  100% {
    background-position: 10rem top;
  }
}

@keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 10rem top;
  }
  100% {
    background-position: 10rem top;
  }
}
</style>
