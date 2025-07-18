<script setup lang="ts">
import { ChatContent } from "./ChatContent";
import { ChatInput } from "./ChatInput";

import { useAgentStore } from "@/stores/agent";
import { useUIStore } from "@/stores/ui";

const agentStore = useAgentStore();
const uiStore = useUIStore();
</script>

<template>
  <div
    v-if="uiStore.drawerVisible"
    class="fixed inset-0 z-50 pointer-events-none"
    style="margin-top: 3.5rem; height: calc(100vh - 3.5rem)"
  >
    <div
      class="absolute top-0 right-0 bg-surface-800 shadow-lg pointer-events-auto h-full w-[35rem] border-l border-surface-900"
    >
      <div class="flex flex-col h-full">
        <div class="flex-1 flex-grow-[4] overflow-auto">
          <ChatContent />
        </div>
        <div v-if="agentStore.selectedId" class="flex-shrink-0 flex-grow-1">
          <ChatInput />
        </div>
      </div>
    </div>
  </div>
</template>
