<script setup lang="ts">
import { getToolName, isToolUIPart } from "ai";
import { computed, toRefs } from "vue";

import { ChatMessageTool } from "../Tool";

import { Markdown } from "./Markdown";
import { Reasoning } from "./Reasoning";

import { type CustomUIMessage } from "@/agents/types";

const props = defineProps<{
  message: CustomUIMessage & { role: "assistant" };
}>();

const { message } = toRefs(props);

const noContentYet = computed(() => {
  if (message.value.metadata?.state !== "streaming") {
    return false;
  }

  if (message.value.parts.length === 0) {
    return true;
  }

  const hasNonStepStartContent = message.value.parts.some(
    (part) => part.type !== "step-start"
  );

  if (!hasNonStepStartContent) {
    return true;
  }

  return false;
});

const isGenerating = computed(() => {
  return message.value.metadata?.state === "streaming";
});

const isAborted = computed(() => {
  return message.value.metadata?.state === "abort";
});
</script>

<template>
  <div class="px-3">
    <template v-if="!noContentYet">
      <template v-for="part in message.parts">
        <template v-if="part.type === 'text'">
          <div class="text-surface-200">
            <Markdown :content="part.text" />
          </div>
        </template>
        <template v-else-if="part.type === 'reasoning'">
          <Reasoning
            :content="part.text"
            :state="part.state"
            :message-state="message.metadata?.state"
          />
        </template>
        <template v-else-if="isToolUIPart(part)">
          <ChatMessageTool
            :tool-name="getToolName(part)"
            :state="part.state"
            :output="part.output"
          />
        </template>
      </template>
    </template>
    <div v-else-if="isGenerating" class="px-2 py-2">
      <div class="flex items-center gap-1 text-surface-400">
        <div class="animate-pulse">•</div>
        <div class="animate-pulse" style="animation-delay: 0.2s">•</div>
        <div class="animate-pulse" style="animation-delay: 0.4s">•</div>
      </div>
    </div>
    <div v-if="isAborted" class="py-2 text-surface-400 opacity-50">Aborted</div>
  </div>
</template>
