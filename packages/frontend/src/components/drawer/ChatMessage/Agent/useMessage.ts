import MarkdownIt from "markdown-it";
import { computed, ref, toRefs, watch } from "vue";

import type { UIMessage } from "@/engine/types/agent";

const md = new MarkdownIt({
  breaks: true,
  linkify: false,
});

export const useAgentMessage = (
  props: { message: UIMessage & { kind: "assistant" } },
) => {
  const { message } = toRefs(props);

  const shouldShowReasoningByDefault = computed(() => {
    return (
      message.value.reasoning !== undefined &&
      message.value.reasoningCompleted !== true
    );
  });

  const showReasoning = ref(shouldShowReasoningByDefault.value);

  watch(shouldShowReasoningByDefault, (newDefault) => {
    showReasoning.value = newDefault;
  });

  watch(
    () => message.value.reasoningCompleted,
    (completed) => {
      if (completed === true) {
        showReasoning.value = false;
      }
    },
  );

  const reasoningText = computed(() => {
    if (
      message.value.completedAt !== undefined &&
      message.value.completedAt !== null &&
      message.value.completedAt > 0
    ) {
      const seconds = Math.round(
        (message.value.completedAt - message.value.createdAt) / 1000,
      );
      return `Thought for ${seconds}s`;
    }

    return "Thinking";
  });

  const renderedMarkdown = computed(() => md.render(message.value.content));

  const toggleReasoning = () => {
    showReasoning.value = !showReasoning.value;
  };

  return {
    showReasoning,
    reasoningText,
    renderedMarkdown,
    toggleReasoning,
  };
};
