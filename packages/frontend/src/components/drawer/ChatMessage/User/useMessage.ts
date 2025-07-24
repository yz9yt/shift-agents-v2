import { computed, toRefs } from "vue";

import { useChat } from "../../ChatInput/useChat";

import type { UIMessage } from "@/engine/types/agent";
import { useAgentStore } from "@/stores/agent";

export const useUserMessage = (props: {
  message: UIMessage & { kind: "user" };
}) => {
  const { message } = toRefs(props);
  const agentStore = useAgentStore();
  const { editMessage } = useChat();

  const selectedAgent = computed(() => agentStore.selectedAgent);

  const isLastUserMessage = computed(() => {
    if (!selectedAgent.value) return false;

    const uiMessages = selectedAgent.value.uiMessages;
    const userMessages = uiMessages.filter((msg) => msg.kind === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];

    return lastUserMessage?.id === message.value.id;
  });

  const isGenerating = computed(() => {
    return (
      selectedAgent.value?.currentStatus !== "idle" && isLastUserMessage.value
    );
  });

  const handleMessageClick = () => {
    if (isGenerating.value) return;
    editMessage(message.value.id, message.value.content);
  };

  return {
    isLastUserMessage,
    isGenerating,
    handleMessageClick,
  };
};
