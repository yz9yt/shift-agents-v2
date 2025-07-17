<script setup lang="ts">
import { ref, computed } from "vue";
import { useAgentStore } from "../stores/agent";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import Badge from "primevue/badge";
import Card from "primevue/card";

const agentStore = useAgentStore();
const newMessage = ref("");

const userMessages = computed(() =>
  agentStore.selectedAgent?.conversation.filter((msg) => msg.role !== "system") || []
);

const getStatusSeverity = (status: string) => {
  switch (status) {
    case "idle": return "success";
    case "thinking": return "info";
    case "calling-tool": return "warning";
    case "error": return "danger";
    default: return "secondary";
  }
};

const messageClass = (role: string) => ({
  "user-message": role === "user",
  "assistant-message": role === "assistant",
  "tool-message": role === "tool",
});

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
  <Panel class="agent-chat">
    <template #header>
      <div class="flex align-items-center justify-content-between w-full">
        <h3 class="m-0">{{ agentStore.selectedAgent?.name }}</h3>
        <Badge
          :value="agentStore.selectedAgent?.currentStatus"
          :severity="getStatusSeverity(agentStore.selectedAgent?.currentStatus || '')"
        />
      </div>
    </template>

    <div class="flex flex-column gap-3">
      <div class="messages-container" style="height: 400px; overflow-y: auto;">
        <Card
          v-for="(message, index) in userMessages"
          :key="index"
          :class="messageClass(message.role)"
          class="message-card"
        >
          <template #content>
            <div class="flex flex-column gap-2">
              <Badge
                :value="message.role"
                :severity="message.role === 'user' ? 'info' : 'success'"
              />
              <p class="m-0">{{ message.content }}</p>
            </div>
          </template>
        </Card>
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
          icon="pi pi-send"
        />
      </div>
    </div>
  </Panel>
</template>

<style scoped>
.message-card {
  margin-bottom: 0.75rem;
}

.user-message {
  margin-left: 2rem;
}

.assistant-message {
  margin-right: 2rem;
}

.tool-message {
  background-color: var(--surface-100);
}

.messages-container {
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  background-color: var(--surface-50);
}
</style>
