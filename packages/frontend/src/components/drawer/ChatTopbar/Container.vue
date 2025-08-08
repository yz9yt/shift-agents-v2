<script setup lang="ts">
import { useUIStore } from "@/stores/ui";
import { useAgentsStore } from "@/stores/agents";

const uiStore = useUIStore();
const agentStore = useAgentsStore();

const closeDrawer = () => {
  uiStore.toggleDrawer();
};

const clearConversation = () => {
  if (agentStore.selectedAgent) {
    agentStore.selectedAgent.messages = [];
    agentStore.selectedToolContext?.todoManager.clearTodos();
  }
};
</script>

<template>
  <div class="h-10 p-2">
    <div class="flex items-center justify-end h-full">
      <div class="flex items-center gap-2">
        <i
          class="fas fa-trash text-surface-400 hover:text-surface-200 cursor-pointer p-1 text-sm"
          @click="clearConversation"
          v-tooltip.bottom="'Clear conversation'"
          :class="{
            'opacity-50 cursor-not-allowed': !agentStore.selectedAgent,
          }"
        />
        <i
          class="fas fa-times text-surface-400 hover:text-surface-200 cursor-pointer p-1 text-sm"
          @click="closeDrawer"
          v-tooltip.bottom="'Close'"
        />
      </div>
    </div>
  </div>
</template>
