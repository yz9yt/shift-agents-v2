<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { ChatMessage } from "../ChatMessage";

import { useContent } from "./useContent";

const { messages, agentStatus } = useContent();
const scrollContainer = ref<HTMLElement | undefined>();

watch(
  [messages, agentStatus],
  async () => {
    if (!scrollContainer.value) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    const isScrolledToBottom = scrollHeight - clientHeight <= scrollTop + 1;

    if (isScrolledToBottom) {
      await nextTick();
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
      }
    }
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div
    ref="scrollContainer"
    class="flex-1 overflow-y-auto p-4 flex flex-col gap-2 h-full"
  >
    <ChatMessage
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />
  </div>
</template>
