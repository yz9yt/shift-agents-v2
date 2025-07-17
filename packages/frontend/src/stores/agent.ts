import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { Agent } from "../engine/agent";
import type { AgentConfig } from "../engine/types";

export const useAgentStore = defineStore("agents", () => {
  const agents = ref<Map<string, Agent>>(new Map());
  const apiKey = ref<string>("");
  const selectedAgentId = ref<string | null>(null);

  const createAgent = (config: AgentConfig) => {
    if (!apiKey.value) {
      throw new Error("API key is required");
    }

    if (agents.value.has(config.id)) {
      throw new Error(`Agent with id ${config.id} already exists`);
    }

    const agent = new Agent(config, {
      apiKey: apiKey.value,
      model: "moonshotai/kimi-k2",
      provider: "groq",
    });
    agents.value.set(config.id, agent);
    return agent;
  };

  const removeAgent = (id: string) => {
    agents.value.delete(id);
  };

  const setApiKey = (key: string) => {
    apiKey.value = key;
  };

  const sendMessageToAgent = async (agentId: string, message: string) => {
    const agent = agents.value.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    await agent.sendMessage(message);
  };

  const agentList = computed(() => Array.from(agents.value.values()));
  const getAgent = (id: string) => agents.value.get(id);
  const selectedAgent = computed(() =>
    selectedAgentId.value ? agents.value.get(selectedAgentId.value) : null
  );

  const selectAgent = (id: string) => {
    if (agents.value.has(id)) {
      selectedAgentId.value = id;
    }
  };

  return {
    agents: agentList,
    apiKey: computed(() => apiKey.value),
    selectedAgent,
    selectedAgentId: computed(() => selectedAgentId.value),
    getAgent,
    createAgent,
    removeAgent,
    setApiKey,
    selectAgent,
    sendMessageToAgent,
  };
});
