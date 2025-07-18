import { useAgentState } from "@/stores/agent";
import { useUIState } from "@/stores/ui";
import { defineStore } from "pinia";
import { computed } from "vue";

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

  return {
    ...uiState,
    ...agentState,
    selectedAgent,
  };
});
