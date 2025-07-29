<script setup lang="ts">
import { useUIStore } from "@/stores/ui";
import { useAgentStore } from "@/stores/agent";

const uiStore = useUIStore();
const agentStore = useAgentStore();

const closeDrawer = () => {
  uiStore.toggleDrawer();
};

const clearConversation = () => {
  if (agentStore.selectedAgent) {
    agentStore.selectedAgent.messageManager.clear();
    agentStore.selectedAgent.todoManager.clearTodos();
  }
};
</script>

<template>
  <div class="h-10 p-2">
    <div class="flex items-center justify-end h-full">
      <div class="flex items-center gap-2">
        <i
          class="fas fa-trash text-surface-400 hover:text-surface-200 cursor-pointer p-1"
          @click="clearConversation"
          v-tooltip.bottom="'Clear conversation'"
          :class="{
            'opacity-50 cursor-not-allowed': !agentStore.selectedAgent,
          }"
        />
        <i
          class="fas fa-times text-surface-400 hover:text-surface-200 cursor-pointer p-1"
          @click="closeDrawer"
          v-tooltip.bottom="'Close'"
        />
      </div>
    </div>
  </div>
</template>
