import { useAgentState } from "@/stores/agent";
import { useUIState } from "@/stores/ui";
import { defineStore } from "pinia";
import { computed, watch } from "vue";

export const useAgentStore = defineStore("stores.shift-agents", () => {
  const uiState = useUIState();
  const agentState = useAgentState();

  const selectedAgent = computed(() => {
    const agentId = uiState.selection.selectedAgentId.value;
    console.log("agentId", agentId);
    if (!agentId) {
      console.log("no agentId");
      return null;
    }

    console.log("selectedAgent", agentId);
    return agentState.getAgent(agentId);
  });

  watch(selectedAgent, (newVal) => {
    console.log("selectedAgent", newVal);
  });

  watch(uiState.selection.selectedAgentId, (newVal) => {
    console.log("selectedAgentId", newVal);
  });

  return {
    ...uiState,
    ...agentState,
    selectedAgent,
  };
});
