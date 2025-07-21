<script setup lang="ts">
import Agent from "./Agent.vue";
import Error from "./Error.vue";
import Tool from "./Tool.vue";
import User from "./User.vue";

import type { UIMessage } from "@/engine/types/agent";

defineProps<{
  message: UIMessage;
}>();
</script>

<template>
  <User v-if="message.kind === 'user'" :message="message" />
  <Agent v-else-if="message.kind === 'assistant'" :message="message" />
  <Error v-else-if="message.kind === 'error'" :message="message" />
  <Tool v-else-if="message.kind === 'tool'" :message="message" />
  <div v-else>Unknown message kind: {{ message }}</div>
</template>
