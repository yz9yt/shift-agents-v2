import { computed } from "vue";

import { useAgentsStore } from "@/stores/agents";

export const useContent = () => {
  const agentStore = useAgentsStore();

  const messages = computed(() => {
    if (!agentStore.selectedAgent) {
      return [];
    }

    return agentStore.selectedAgent.messages;
  });

  const hasMessages = computed(() => messages.value.length > 0);
  const hasSelectedAgent = computed(() => !!agentStore.selectedAgent);
  const agentStatus = computed(() => agentStore.selectedAgent?.status);
  const error = computed(() => agentStore.selectedAgent?.error);

  return {
    messages,
    hasMessages,
    hasSelectedAgent,
    agentStatus,
    error,
  };
};
