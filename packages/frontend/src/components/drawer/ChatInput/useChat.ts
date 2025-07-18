import { useAgentStore } from "@/stores";
import { computed } from "vue";

export const useChat = () => {
  const agentStore = useAgentStore();
  const selectedAgent = computed(() => agentStore.selectedAgent);

  const messages = computed(() => {
    if (!selectedAgent.value) {
      return [];
    }

    return selectedAgent.value.conversation;
  });

  const sendMessage = (message: string) => {
    console.log("sending message", message);
    if (!selectedAgent.value) {
      return;
    }

    console.log("selectedAgent", selectedAgent.value);
    try {
      selectedAgent.value.sendMessage(message);
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return {
    messages,
    sendMessage,
  };
};
