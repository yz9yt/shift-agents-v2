import { useAgentStore } from "@/stores";
import { computed } from "vue";

export const useContent = () => {
  const agentStore = useAgentStore();
  const selectedAgent = computed(() => agentStore.selectedAgent);

  const messages = computed(() => {
    if (!selectedAgent.value) {
      return [];
    }

    return selectedAgent.value.conversation.filter(
      (message) => message.role !== "system"
    );
  });

  const hasMessages = computed(() => messages.value.length > 0);

  const hasSelectedAgent = computed(() => !!selectedAgent.value);

  return {
    messages,
    hasMessages,
    hasSelectedAgent,
    selectedAgent,
  };
};
