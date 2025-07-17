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


</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <Panel v-if="agentStore.agents.length === 0" header="Create Your First Agent" class="mb-6">
      <div class="space-y-4">
        <InputText
          v-model="apiKey"
          placeholder="Enter your API key"
          class="w-full"
        />
        <Button
          @click="createAgent"
          label="Create Agent"
          class="w-full"
        />
      </div>
    </Panel>

    <div v-else class="space-y-6">
      <Panel header="Agents" class="mb-6">
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="agent in agentStore.agents"
              :key="agent.id"
              class="cursor-pointer border-2 p-4 rounded"
              @click="agentStore.selectAgent(agent.id)"
            >
              <h3 class="font-semibold text-lg">{{ agent.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ agent.id }}</p>
              <div class="flex justify-between items-center">
                <span class="text-sm">{{ agent.currentStatus }}</span>
                <span v-if="agentStore.selectedAgentId === agent.id" class="text-blue-600 font-medium">Selected</span>
              </div>
            </div>
          </div>

          <Button
            @click="createNewAgent"
            label="Create New Agent"
            outlined
          />
        </div>
      </Panel>

      <Test v-if="agentStore.selectedAgent" />
    </div>
  </div>
</template>
