<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ref } from "vue";

import { useChat } from "./useChat";

const { sendMessage } = useChat();

const message = ref("");
const isLoading = ref(false);

const handleSend = () => {
  if (!message.value.trim() || isLoading.value) {
    return;
  }

  const messageToSend = message.value.trim();
  message.value = "";

  try {
    isLoading.value = true;
    sendMessage(messageToSend);
  } finally {
    isLoading.value = false;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};
</script>

<template>
  <div class="flex gap-2 p-4 border-t border-surface-700">
    <InputText
      v-model="message"
      placeholder="Type your message..."
      :disabled="isLoading"
      class="flex-1"
      :pt="{
        root: 'bg-surface-700 border-surface-600 text-surface-100',
      }"
      @keydown="handleKeydown"
    />
    <Button label="Send" @click="handleSend" />
  </div>
</template>
