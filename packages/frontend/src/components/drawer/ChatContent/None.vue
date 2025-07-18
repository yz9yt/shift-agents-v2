<script setup lang="ts">
import { useAgentStore } from "@/stores";

const agentStore = useAgentStore();
</script>

<template>
  <div class="flex-1 flex items-center justify-center text-surface-400">
    <div class="text-center">
      <div class="text-lg mb-2">Start a conversation</div>
      <div class="text-sm">Send a message to begin</div>
      <pre>[debug] session ID: {{ agentStore.selection.selectedAgentId }}</pre>
    </div>
  </div>
</template>
