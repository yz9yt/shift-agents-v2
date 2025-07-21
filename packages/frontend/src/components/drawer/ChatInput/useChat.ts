import { computed } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useAgentStore } from "@/stores/agent";

export const useChat = () => {
  const agentStore = useAgentStore();
  const sdk = useSDK();

  const messages = computed(() => {
    if (!agentStore.selectedAgent) {
      return [];
    }

    return agentStore.selectedAgent.messageManager.getApiMessages();
  });

  const sendMessage = (message: string) => {
    console.log("sending message", message);
    if (!agentStore.selectedAgent) {
      return;
    }

    console.log("selectedAgent", agentStore.selectedAgent);
    try {
      agentStore.selectedAgent.sendMessage(message);
    } catch (error) {
      sdk.window.showToast("Error sending message", {
        variant: "error",
      });
      console.error("Error sending message", error);
    }
  };

  return {
    messages,
    sendMessage,
  };
};
