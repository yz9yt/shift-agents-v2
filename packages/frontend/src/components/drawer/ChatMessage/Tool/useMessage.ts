import { computed, ref, toRefs } from "vue";

import type { UIMessage } from "@/engine/types/agent";

export const useToolMessage = (props: {
  message: UIMessage & { kind: "tool" };
}) => {
  const { message } = toRefs(props);

  const showDetails = ref(false);

  const isProcessing = computed(() => message.value.status === "processing");

  const formatToolCalls = computed(() => {
    return message.value.metadata.message;
  });

  const toolDetails = computed(() => {
    return message.value.metadata.details;
  });

  const toolIcon = computed(() => {
    return message.value.metadata.icon;
  });

  const toggleDetails = () => {
    if (toolDetails.value) {
      showDetails.value = !showDetails.value;
    }
  };

  return {
    showDetails,
    isProcessing,
    formatToolCalls,
    toolDetails,
    toolIcon,
    toggleDetails,
  };
};
