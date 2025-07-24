<script setup lang="ts">
import { ChatMessageAgent } from "./Agent";
import { ChatMessageError } from "./Error";
import { ChatMessageTool } from "./Tool";
import { ChatMessageUser } from "./User";

import type { UIMessage } from "@/engine/types/agent";

defineProps<{
  message: UIMessage;
}>();
</script>

<template>
  <ChatMessageUser v-if="message.kind === 'user'" :message="message" />
  <ChatMessageAgent
    v-else-if="message.kind === 'assistant'"
    :message="message"
  />
  <ChatMessageError v-else-if="message.kind === 'error'" :message="message" />
  <ChatMessageTool v-else-if="message.kind === 'tool'" :message="message" />
  <div v-else>Unknown message kind: {{ message }}</div>
</template>
