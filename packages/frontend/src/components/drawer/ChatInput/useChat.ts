import { computed } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useAgentStore } from "@/stores/agent";
import { useConfigStore } from "@/stores/config";

export const useChat = () => {
  const agentStore = useAgentStore();
  const configStore = useConfigStore();
  const sdk = useSDK();

  const messages = computed(() => {
    if (!agentStore.selectedAgent) {
      return [];
    }

    return agentStore.selectedAgent.messageManager.getApiMessages();
  });

  const sendMessage = (message: string) => {
    if (!agentStore.selectedAgent) {
      return;
    }

    try {
      agentStore.selectedAgent.updateConfig((draft) => {
        draft.openRouterConfig.model = configStore.model;
        draft.openRouterConfig.reasoningEnabled =
          configStore.selectedModel?.reasoningModel || false;
      });
      agentStore.selectedAgent.sendMessage(message);
    } catch (error) {
      sdk.window.showToast("Error sending message", {
        variant: "error",
      });
      console.error("Error sending message", error);
    }
  };

  const abortMessage = () => {
    agentStore.abortSelectedAgent();
  };

  return {
    messages,
    sendMessage,
    abortMessage,
  };
};
