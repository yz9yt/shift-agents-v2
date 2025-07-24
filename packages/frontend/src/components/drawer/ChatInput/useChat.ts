import { computed } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useAgentStore } from "@/stores/agent";
import { useConfigStore } from "@/stores/config";

export const useChat = () => {
  const agentStore = useAgentStore();
  const configStore = useConfigStore();
  const sdk = useSDK();

  const inputMessage = computed({
    get: () => agentStore.selectedAgent?.inputMessage ?? "",
    set: (value: string) => {
      agentStore.setInputMessage(
        value,
        agentStore.selectedAgent?.isEditingMessage ?? false
      );
    },
  });

  const isEditingMessage = computed(
    () => agentStore.selectedAgent?.isEditingMessage ?? false
  );

  const isAgentIdle = computed(
    () => agentStore.selectedAgent?.currentStatus === "idle"
  );

  const canSendMessage = computed(() => {
    return isAgentIdle.value && inputMessage.value.trim() !== "";
  });

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

    if (!configStore.openRouterApiKey || configStore.openRouterApiKey === "") {
      sdk.window.showToast(
        "OpenRouter API key is required. Please go to the Shift Agents page to configure your API key.",
        {
          variant: "error",
        }
      );
      return;
    }

    try {
      agentStore.selectedAgent.updateConfig((draft) => {
        const selectedPrompt = configStore.customPrompts.find(
          (prompt) => prompt.id === agentStore.selectedAgent?.selectedPromptId
        );

        console.log("selectedPrompt", selectedPrompt);

        draft.openRouterConfig.model = configStore.model;
        draft.openRouterConfig.reasoningEnabled =
          configStore.selectedModel?.reasoningModel ?? false;
        draft.openRouterConfig.apiKey = configStore.openRouterApiKey;
        draft.jitConfig.jitInstructions = selectedPrompt?.content ?? "";
      });

      agentStore.selectedAgent.sendMessage(message);
    } catch (error) {
      sdk.window.showToast("Error sending message", {
        variant: "error",
      });
      console.error("Error sending message", error);
    }
  };

  const handleSend = () => {
    if (!canSendMessage.value) {
      return;
    }

    const messageToSend = inputMessage.value.trim();
    inputMessage.value = "";
    sendMessage(messageToSend);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const abortMessage = () => {
    agentStore.abortSelectedAgent();
  };

  const editMessage = (messageId: string, content: string) => {
    agentStore.editMessage(messageId, content);
  };

  const clearInputMessage = () => {
    agentStore.clearInputMessage();
  };

  return {
    messages,
    inputMessage,
    isEditingMessage,
    isAgentIdle,
    canSendMessage,
    sendMessage,
    abortMessage,
    editMessage,
    clearInputMessage,
    handleSend,
    handleKeydown,
  };
};
