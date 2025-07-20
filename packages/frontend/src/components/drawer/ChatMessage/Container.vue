<script setup lang="ts">
import User from "./User.vue";
import Error from "./Error.vue";
import Agent from "./Agent.vue";
import Tool from "./Tool.vue";

import type { FrontendMessage } from "@/engine/types";

defineProps<{
  message: FrontendMessage;
}>();
</script>

<template>
  <User v-if="message.role === 'user'" :message="message" />
  <Agent v-else-if="message.role === 'assistant'" :message="message" />
  <Error v-else-if="message.role === 'error'" :message="message" />
  <Tool v-else-if="message.role === 'tool'" :message="message" />
  <div v-else>Unknown message role: {{ message.role }}</div>
</template>
