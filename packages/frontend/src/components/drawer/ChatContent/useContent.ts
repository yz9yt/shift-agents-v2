import { computed } from "vue";

import { useAgentStore } from "@/stores/agent";

export const useContent = () => {
  const agentStore = useAgentStore();

  const messages = computed(() => {
    if (!agentStore.selectedAgent) {
      return [];
    }

    return agentStore.selectedAgent.uiMessages;
  });

  const hasMessages = computed(() => messages.value.length > 0);
  const hasSelectedAgent = computed(() => !!agentStore.selectedAgent);
  const agentStatus = computed(() => agentStore.selectedAgent?.currentStatus);

  return {
    messages,
    hasMessages,
    hasSelectedAgent,
    agentStatus,
  };
};
