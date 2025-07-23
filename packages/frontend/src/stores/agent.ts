import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { Agent } from "@/engine/agent";
import { useSDK } from "@/plugins/sdk";
import { SECRET_API_KEY } from "@/secrets";
import { generateSystemPrompt } from "@/engine/prompt";
import { useConfigStore } from "./config";

export const useAgentStore = defineStore("stores.agent", () => {
  const agents = ref(new Map<string, Agent>());
  const selectedId = ref<string | undefined>(undefined);
  const sdk = useSDK();
  const configStore = useConfigStore();

  const createAgentFromSessionId = (replaySessionId: string) => {
    const model = "anthropic/claude-3.7-sonnet";
    const maxIterations = 25;

    const agent = new Agent(sdk, {
      id: replaySessionId,
      name: "Shift Agent",
      systemPrompt: generateSystemPrompt({
        model,
        replaySessionId,
        maxIterations,
      }),
      jitConfig: {
        replaySessionId,
        jitInstructions: "You are a helpful assistant.",
        maxIterations,
      },
      openRouterConfig: {
        apiKey: SECRET_API_KEY,
        model,
        reasoning: configStore.reasoningConfig,
      },
    });
    agents.value.set(replaySessionId, agent);
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

  const abortSelectedAgent = () => {
    if (!selectedId.value) {
      throw new Error("No agent selected");
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      console.log("aborting agent", selectedId.value);
      agent.abort();
    }
  };

  return {
    agents: computed(() => Array.from(agents.value.values())),
    getAgent,
    removeAgent,
    createAgentFromSessionId,
    selectedAgent: computed(() => getAgent(selectedId.value ?? "")),
    selectedId,
    selectAgent,
    resetSelection,
    abortSelectedAgent,
  };
});
