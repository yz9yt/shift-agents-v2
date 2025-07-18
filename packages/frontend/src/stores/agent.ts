import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { Agent } from "../engine/agent";

import { useSDK } from "@/plugins/sdk";
import { SECRET_API_KEY } from "@/secrets";

export const useAgentStore = defineStore("stores.agent", () => {
  const agents = ref<Map<string, Agent>>(new Map());
  const selectedId = ref<string | undefined>(undefined);
  const sdk = useSDK();

  const createAgentFromSessionId = (sessionId: string) => {
    const agent = new Agent(
      sdk,
      {
        id: sessionId,
        name: "Agent 1",
        systemPrompt: "You are a helpful assistant.",
        jitConfig: {
          replaySessionId: sessionId,
          jitInstructions: "You are a helpful assistant.",
          maxIterations: 10,
        },
      },
      {
        apiKey: SECRET_API_KEY,
        model: "moonshotai/kimi-k2",
      },
    );
    agents.value.set(sessionId, agent);
    return agent;
  };

  const removeAgent = (id: string) => {
    agents.value.delete(id);
  };

  const selectAgent = (id: string) => {
    if (!agents.value.has(id)) {
      createAgentFromSessionId(id);
    }

    selectedId.value = id;
  };

  const resetSelection = () => {
    selectedId.value = undefined;
  };

  const getAgent = (id: string) => agents.value.get(id);

  return {
    agents: computed(() => Array.from(agents.value.values())),
    getAgent,
    removeAgent,
    createAgentFromSessionId,
    selectedAgent: computed(() => getAgent(selectedId.value ?? "")),
    selectedId,
    selectAgent,
    resetSelection,
  };
});
