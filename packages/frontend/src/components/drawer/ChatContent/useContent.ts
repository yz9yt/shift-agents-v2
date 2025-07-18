import { computed } from "vue";

import { useAgentStore } from "@/stores/agent";

export const useContent = () => {
  const agentStore = useAgentStore();

  const messages = computed(() => {
    if (!agentStore.selectedAgent) {
      return [];
    }

    return agentStore.selectedAgent.conversation.filter(
      (message) => message.role !== "system",
    );
  });

  const hasMessages = computed(() => messages.value.length > 0);
  const hasSelectedAgent = computed(() => !!agentStore.selectedAgent);

  return {
    messages,
    hasMessages,
    hasSelectedAgent,
  };
};
