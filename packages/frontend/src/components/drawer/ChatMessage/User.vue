<script setup lang="ts">
import Button from "primevue/button";
import { computed, toRefs } from "vue";

import { useChat } from "../ChatInput/useChat";

import type { UIMessage } from "@/engine/types/agent";
import { useAgentStore } from "@/stores/agent";

const agentStore = useAgentStore();
const { editMessage } = useChat();

const props = defineProps<{
  message: UIMessage & { kind: "user" };
}>();

const { message } = toRefs(props);

const selectedAgent = computed(() => agentStore.selectedAgent);

const isLastUserMessage = computed(() => {
  if (!selectedAgent.value) return false;

  const uiMessages = selectedAgent.value.uiMessages;
  const userMessages = uiMessages.filter((msg) => msg.kind === "user");
  const lastUserMessage = userMessages[userMessages.length - 1];

  return lastUserMessage?.id === message.value.id;
});

const isGenerating = computed(() => {
  return (
    selectedAgent.value?.currentStatus !== "idle" && isLastUserMessage.value
  );
});

const handleMessageClick = () => {
  if (isGenerating.value) return;
  editMessage(message.value.id, message.value.content);
};

const handleStop = () => {
  agentStore.abortSelectedAgent();
};
</script>

<template>
  <div
    class="p-3 rounded-lg bg-surface-900 ml-auto shadow-lg shadow-surface-800 w-full select-text group relative"
  >
    <div
      class="text-surface-200 whitespace-pre-wrap break-words font-mono text-sm cursor-pointer hover:bg-surface-800/50 rounded p-1 -m-1 transition-colors"
      :class="{ 'cursor-not-allowed opacity-50': isGenerating }"
      @dblclick="handleMessageClick"
    >
      {{ message.content }}
    </div>

    <div
      v-if="isGenerating"
      class="mt-3 pt-3 border-t border-surface-700 flex items-center justify-between"
    >
      <div class="flex items-center gap-2 text-surface-400 text-sm font-mono">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Generating...</span>
      </div>

      <Button
        severity="danger"
        size="small"
        icon="fas fa-square"
        label="Stop"
        :pt="{
          root: {
            class:
              'bg-red-400/10 text-red-400 text-xs py-1 px-2 flex items-center gap-1 rounded hover:bg-red-400/20 transition-colors duration-200 cursor-pointer',
          },
          icon: {
            class: 'text-xs',
          },
          label: {
            class: 'text-xs font-medium',
          },
        }"
        @click="handleStop"
      />
    </div>
  </div>
</template>
