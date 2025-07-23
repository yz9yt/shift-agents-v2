<script setup lang="ts">
import Button from "primevue/button";
import Select from "primevue/select";
import { computed, onMounted, ref, watch } from "vue";

import { useChat } from "./useChat";

import { useAgentStore } from "@/stores/agent";
import { useConfigStore } from "@/stores/config";

const {
  sendMessage,
  abortMessage,
  inputMessage,
  isEditingMessage,
} = useChat();

const agentStore = useAgentStore();
const configStore = useConfigStore();
const selectedAgent = computed(() => agentStore.selectedAgent);

const textareaRef = ref<HTMLTextAreaElement>();

const isAgentIdle = computed(
  () => selectedAgent.value?.currentStatus === "idle"
);
const canSendMessage = computed(
  () => isAgentIdle.value && inputMessage.value.trim() !== ""
);

onMounted(() => {
  textareaRef.value?.focus();
});

watch(
  isEditingMessage,
  (isEditing) => {
    if (isEditing && textareaRef.value) {
      textareaRef.value.focus();
    }
  },
  { flush: "post" }
);

const handleSend = () => {
  if (!canSendMessage.value) {
    return;
  }

  const messageToSend = inputMessage.value.trim();
  inputMessage.value = "";
  sendMessage(messageToSend);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};
</script>

<template>
  <div
    class="p-4 bg-surface-900 h-40 flex flex-col gap-2 border-t border-surface-700"
  >
    <textarea
      ref="textareaRef"
      v-model="inputMessage"
      placeholder="Message the Shift agent"
      :disabled="!isAgentIdle"
      :class="{
        'opacity-50 cursor-not-allowed': !isAgentIdle,
        'text-surface-200': isAgentIdle,
        'text-surface-400': !isAgentIdle,
      }"
      class="h-30 border-0 outline-none font-mono resize-none bg-transparent flex-1 text-sm focus:outline-none focus:ring-0 overflow-y-auto scrollbar-hide"
      style="scrollbar-width: none; -ms-overflow-style: none"
      spellcheck="false"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      @keydown="handleKeydown"
    />

    <div class="flex justify-between gap-2 items-center">
      <Select
        v-model="configStore.model"
        :options="configStore.models"
        option-label="name"
        option-value="id"
        option-group-label="label"
        option-group-children="items"
        class="text-sm font-mono w-50"
        :pt="{
          list: {
            class: 'w-60',
          },
        }"
      >
        <template #option="slotProps">
          <div class="flex items-center justify-between w-full">
            <span>{{ slotProps.option.name }}</span>
            <div class="flex items-center gap-2">
              <i
                v-if="slotProps.option.reasoningModel"
                class="fas fa-brain text-blue-400 text-xs"
                title="This model supports reasoning"
              />
              <i
                v-if="slotProps.option.isRecommended"
                class="fas fa-star text-secondary-400 text-xs"
                title="This model is recommended"
              />
            </div>
          </div>
        </template>
      </Select>

      <div class="flex items-center gap-2">
        <Button
          v-if="configStore.selectedModel?.reasoningModel"
          severity="tertiary"
          icon="fas fa-brain"
          disabled
          :pt="{
            root: {
              class:
                'bg-secondary-400/20 text-secondary-400 py-1 px-1.5 flex items-center justify-center rounded-md h-8 w-8 opacity-75',
            },
            icon: {
              class: 'text-sm',
            },
          }"
        />

        <Button
          v-if="isAgentIdle"
          severity="tertiary"
          icon="fas fa-arrow-circle-up"
          :disabled="!canSendMessage"
          :pt="{
            root: {
              class: canSendMessage
                ? 'bg-surface-700/50 text-surface-200 text-sm py-1.5 px-2 flex items-center justify-center rounded-md hover:text-white transition-colors duration-200 h-8 w-8 cursor-pointer'
                : 'bg-surface-700/20 text-surface-400 text-sm py-1.5 px-2 flex items-center justify-center rounded-md h-8 w-8 cursor-not-allowed',
            },
          }"
          @click="handleSend"
        />
        <Button
          v-else
          severity="danger"
          icon="fas fa-square"
          :pt="{
            root: {
              class:
                'bg-red-400/10 text-red-400 py-1 px-1.5 flex items-center justify-center rounded-md hover:bg-red-400/20 transition-colors duration-200 h-8 w-8 cursor-pointer',
            },
            icon: {
              class: 'text-sm',
            },
          }"
          @click="abortMessage"
        />
      </div>
    </div>
  </div>
</template>
