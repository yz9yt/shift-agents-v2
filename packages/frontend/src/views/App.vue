<script setup lang="ts">
import Test from "@/components/Test.vue";
import { useAgentStore } from "@/stores/agent";
import { ref, computed } from "vue";
import { SECRET_API_KEY } from "@/secrets";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Panel from "primevue/panel";
import Badge from "primevue/badge";

const agentStore = useAgentStore();
const apiKey = ref(SECRET_API_KEY);

const createAgent = () => {
  if (!apiKey.value) {
    alert("Please enter an API key");
    return;
  }

  agentStore.setApiKey(apiKey.value);
  const agentId = `agent-${Date.now()}`;
  agentStore.createAgent({
    id: agentId,
    name: "Agent 1",
    systemPrompt: "You are a helpful assistant.",
  });
  agentStore.selectAgent(agentId);
};

const createNewAgent = () => {
  if (!agentStore.apiKey) {
    alert("Please enter an API key first");
    return;
  }

  const agentId = `agent-${Date.now()}`;
  const agentNumber = agentStore.agents.length + 1;
  agentStore.createAgent({
    id: agentId,
    name: `Agent ${agentNumber}`,
    systemPrompt: "You are a helpful assistant.",
  });
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case "idle": return "success";
    case "thinking": return "info";
    case "calling-tool": return "warning";
    case "error": return "danger";
    default: return "secondary";
  }
};
</script>

<template>
  <div class="p-4">
    <Panel v-if="agentStore.agents.length === 0" header="Create Your First Agent">
      <div class="flex flex-column gap-3">
        <InputText
          v-model="apiKey"
          placeholder="Enter your API key"
          class="w-full"
        />
        <Button
          @click="createAgent"
          label="Create Agent"
          icon="pi pi-plus"
          class="w-full"
        />
      </div>
    </Panel>

    <div v-else class="flex flex-column gap-4">
      <Panel header="Agent Management">
        <div class="flex flex-column gap-3">
          <div class="flex flex-wrap gap-3">
            <Card
              v-for="agent in agentStore.agents"
              :key="agent.id"
              class="agent-card cursor-pointer"
              :class="{ 'selected-agent': agentStore.selectedAgentId === agent.id }"
              @click="agentStore.selectAgent(agent.id)"
            >
              <template #title>
                <div class="flex align-items-center justify-content-between">
                  <span>{{ agent.name }}</span>
                  <Badge
                    v-if="agentStore.selectedAgentId === agent.id"
                    value="Active"
                    severity="success"
                  />
                </div>
              </template>
              <template #subtitle>
                {{ agent.id }}
              </template>
              <template #content>
                <Badge
                  :value="agent.currentStatus"
                  :severity="getStatusSeverity(agent.currentStatus)"
                />
              </template>
            </Card>
          </div>

          <Button
            @click="createNewAgent"
            label="Create New Agent"
            icon="pi pi-plus"
            outlined
            class="w-max"
          />
        </div>
      </Panel>

      <Test v-if="agentStore.selectedAgent" />
    </div>
  </div>
</template>

<style scoped>
.agent-card {
  min-width: 250px;
  max-width: 300px;
  transition: all 0.2s ease;
}

.agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selected-agent {
  border: 2px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
}
</style>
