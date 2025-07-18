<script setup lang="ts">
import { useContent } from "./useContent";
import { ChatMessage } from "../ChatMessage";

const { messages } = useContent();
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <ChatMessage
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />
  </div>
</template>
