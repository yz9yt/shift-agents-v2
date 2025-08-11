import { defineStore } from "pinia";
import { ref } from "vue";

type UIState = {
  input: string;
  selectedPromptId: string | undefined;
};

export const useUIStore = defineStore("stores.ui", () => {
  const drawerVisible = ref(false);
  const agentsUI = ref<Record<string, UIState>>({});

  const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value;
  };

  function getUIState(agentId: string): UIState {
    if (!agentsUI.value[agentId]) {
      agentsUI.value[agentId] = {
        input: "",
        selectedPromptId: undefined,
      };
    }

    return agentsUI.value[agentId];
  }

  function setInput(agentId: string, value: string) {
    getUIState(agentId).input = value;
  }

  function getInput(agentId: string) {
    return getUIState(agentId).input;
  }

  function setSelectedPromptId(agentId: string, value: string | undefined) {
    getUIState(agentId).selectedPromptId = value;
  }

  function getSelectedPromptId(agentId: string) {
    return getUIState(agentId).selectedPromptId;
  }

  return {
    drawerVisible,
    toggleDrawer,
    agentsUI,
    setInput,
    getInput,
    setSelectedPromptId,
    getSelectedPromptId,
  };
});
