<script setup lang="ts">
import { ref, computed } from "vue";
import { useAgentStore } from "../stores/agent";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Panel from "primevue/panel";

const agentStore = useAgentStore();
const newMessage = ref("");

const userMessages = computed(() =>
  agentStore.selectedAgent?.conversation.filter((msg) => msg.role !== "system") || []
);


const sendMessage = async () => {
  if (!newMessage.value.trim() || !agentStore.selectedAgent) return;

  const message = newMessage.value;
  newMessage.value = "";

  try {
    await agentStore.selectedAgent.sendMessage(message);
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};
</script>

<template>
  <Panel>
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-lg font-semibold">{{ agentStore.selectedAgent?.name }}</h3>
        <span class="text-sm bg-surface-700 text-white px-2 py-1 rounded">{{ agentStore.selectedAgent?.currentStatus }}</span>
      </div>
    </template>

    <div class="space-y-4">
      <div class="h-96 overflow-y-auto border rounded p-4 space-y-3">
        <div
          v-for="(message, index) in userMessages"
          :key="index"
          class="p-3 rounded"
          :class="message.role === 'user' ? 'bg-surface-900 text-white ml-8' : 'bg-surface-700 text-white mr-8'"
        >
          <div class="text-xs font-medium text-gray-300 mb-1">{{ message.role }}</div>
          <div>{{ message.content }}</div>
        </div>
      </div>

      <div class="flex gap-2">
        <InputText
          v-model="newMessage"
          @keyup.enter="sendMessage"
          :disabled="agentStore.selectedAgent?.currentStatus !== 'idle'"
          placeholder="Type your message..."
          class="flex-1"
        />
        <Button
          @click="sendMessage"
          :disabled="!newMessage.trim() || agentStore.selectedAgent?.currentStatus !== 'idle'"
          label="Send"
        />
      </div>
    </div>
  </Panel>
</template>
