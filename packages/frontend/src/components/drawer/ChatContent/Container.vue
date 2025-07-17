<script setup lang="ts">
import { useContent } from "./useContent";
import { ChatMessage } from "../ChatMessage";
import { useAgentStore } from "@/stores";

const { messages, hasMessages } = useContent();
const agentStore = useAgentStore();
</script>

<template>
  <div class="flex flex-col h-full bg-surface-800">
    <div
      v-if="!hasMessages"
      class="flex-1 flex items-center justify-center text-surface-400"
    >
      <div class="text-center">
        <div class="text-lg mb-2">Start a conversation</div>
        <div class="text-sm">Send a message to begin</div>
        <pre>[debug] session ID: {{ agentStore.selection.selectedAgentId }}</pre>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
      <ChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
      />
    </div>
  </div>
</template>
