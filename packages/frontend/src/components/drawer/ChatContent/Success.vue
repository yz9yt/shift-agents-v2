<script setup lang="ts">
import { ChatMessage } from "../ChatMessage";

import { useContent } from "./useContent";

const { messages, agentStatus } = useContent();
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <ChatMessage
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />
    <div v-if="agentStatus === 'idle'" class="text-sm text-surface-400">
      Agent is paused.
    </div>
    <div v-if="agentStatus === 'error'" class="text-sm text-surface-400">
      Agent encountered an error.
    </div>
    <div v-if="agentStatus === 'queryingAI'" class="text-sm text-surface-400">
      Agent is querying the AI.
    </div>
    <div v-if="agentStatus === 'callingTools'" class="text-sm text-surface-400">
      Agent is calling tools.
    </div>
  </div>
</template>
