import type { APIMessage } from "@/engine/types";
import { computed } from "vue";

export const useMessage = (message: APIMessage) => {
  const isUser = computed(() => message.role === "user");
  const isAssistant = computed(() => message.role === "assistant");
  const isSystem = computed(() => message.role === "system");
  const isTool = computed(() => message.role === "tool");

  const hasContent = computed(() => !!message.content?.trim());
  const hasToolCalls = computed(() => !!message.tool_calls?.length);
  const hasToolCallId = computed(() => !!message.tool_call_id);
  const hasName = computed(() => !!message.name);

  const displayName = computed(() => {
    if (message.name) return message.name;
    return message.role;
  });

  const messageClasses = computed(() => ({
    'bg-surface-900 ml-auto': isUser.value,
    'bg-surface-700 mr-auto': isAssistant.value,
    'bg-surface-600 mr-auto': isSystem.value,
    'bg-surface-500 mr-auto text-surface-200': isTool.value,
  }));

  const formatToolCalls = computed(() => {
    if (!message.tool_calls?.length) return "";

    return message.tool_calls
      .map(call => `${call.function.name}(${call.function.arguments})`)
      .join(", ");
  });

  return {
    isUser,
    isAssistant,
    isSystem,
    isTool,
    hasContent,
    hasToolCalls,
    hasToolCallId,
    hasName,
    displayName,
    messageClasses,
    formatToolCalls,
  };
};
