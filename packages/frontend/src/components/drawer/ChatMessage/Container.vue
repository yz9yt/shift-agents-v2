<script setup lang="ts">
import type { APIMessage } from "@/engine/types";
import { useMessage } from "./useMessage";

const props = defineProps<{
  message: APIMessage;
}>();

const {
  hasContent,
  hasToolCalls,
  hasToolCallId,
  hasName,
  displayName,
  messageClasses,
  formatToolCalls,
} = useMessage(props.message);
</script>

<template>
  <div
    class="p-3 rounded-lg max-w-[85%]"
    :class="messageClasses"
  >
    <div class="text-xs font-medium text-surface-300 mb-2 uppercase tracking-wide">
      {{ displayName }}
      <span v-if="hasName && message.name !== message.role" class="text-surface-400">
        • {{ message.role }}
      </span>
    </div>

    <div
      v-if="hasContent"
      class="text-surface-100 whitespace-pre-wrap break-words"
    >
      {{ message.content }}
    </div>

    <div
      v-if="hasToolCalls"
      class="mt-2 p-2 bg-surface-800 rounded text-xs text-surface-300 border border-surface-600"
    >
      <div class="font-medium mb-1">Tool Calls:</div>
      <div class="font-mono">{{ formatToolCalls }}</div>
    </div>

    <div
      v-if="hasToolCallId"
      class="mt-1 text-xs text-surface-400 font-mono"
    >
      Tool Call ID: {{ message.tool_call_id }}
    </div>
  </div>
</template>
