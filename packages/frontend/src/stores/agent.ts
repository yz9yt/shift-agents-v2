import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { useConfigStore } from "./config";

import { Agent } from "@/engine/agent";
import { generateSystemPrompt } from "@/engine/prompt";
import { useSDK } from "@/plugins/sdk";

export const useAgentStore = defineStore("stores.agent", () => {
  const agents = ref(new Map<string, Agent>());
  const selectedId = ref<string | undefined>(undefined);
  const sdk = useSDK();
  const configStore = useConfigStore();

  const createAgentFromSessionId = (replaySessionId: string) => {
    const maxIterations = 35;

    const agent = new Agent(sdk, {
      id: replaySessionId,
      name: "Shift Agent",
      systemPrompt: generateSystemPrompt({
        model: configStore.model,
        replaySessionId,
        maxIterations,
      }),
      jitConfig: {
        replaySessionId,
        jitInstructions: "You are a helpful assistant.",
        maxIterations,
      },
      openRouterConfig: {
        apiKey: configStore.openRouterApiKey,
        model: configStore.model,
        reasoningEnabled: configStore.selectedModel?.reasoningModel ?? false,
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
    if (selectedId.value === undefined) {
      throw new Error("No agent selected");
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      agent.abort();
    }
  };

  const updateUserMessage = (messageId: string, content: string): boolean => {
    if (selectedId.value === undefined) {
      return false;
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      return agent.updateUserMessage(messageId, content);
    }
    return false;
  };

  const removeMessagesAfter = (messageId: string): void => {
    if (selectedId.value === undefined) {
      return;
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      agent.removeMessagesAfter(messageId);
    }
  };

  const setInputMessage = (content: string, isEditing: boolean = false): void => {
    if (selectedId.value === undefined) {
      return;
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      agent.setInputMessage(content, isEditing);
    }
  };

  const clearInputMessage = (): void => {
    if (selectedId.value === undefined) {
      return;
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      agent.clearInputMessage();
    }
  };

  const editMessage = (messageId: string, content: string): void => {
    if (selectedId.value === undefined) {
      return;
    }

    const agent = getAgent(selectedId.value);
    if (agent) {
      agent.editMessage(messageId, content);
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
    updateUserMessage,
    removeMessagesAfter,
    setInputMessage,
    clearInputMessage,
    editMessage,
  };
});
