<script setup lang="ts">
import { ref } from "vue";
import { useChat } from "./useChat";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const { sendMessage } = useChat();

const message = ref("");
const isLoading = ref(false);

const handleSend = async () => {
  if (!message.value.trim() || isLoading.value) {
    return;
  }

  const messageToSend = message.value.trim();
  message.value = "";
  isLoading.value = true;

  try {
    await sendMessage(messageToSend);
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
      @keydown="handleKeydown"
      class="flex-1"
      :pt="{
        root: 'bg-surface-700 border-surface-600 text-surface-100',
      }"
    />
    <Button
      @click="handleSend"
      label="Send"
    />
  </div>
</template>
