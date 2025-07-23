<script setup lang="ts">
import Button from "primevue/button";
import Select from "primevue/select";
import { computed, onMounted, ref } from "vue";

import { useChat } from "./useChat";

import { useAgentStore } from "@/stores/agent";

const { sendMessage, abortMessage } = useChat();

const agentStore = useAgentStore();
const selectedAgent = computed(() => agentStore.selectedAgent);

const message = ref("");
const selectedModel = ref("Gemini 2.5 Pro");
const textareaRef = ref<HTMLTextAreaElement>();

const isAgentIdle = computed(
  () => selectedAgent.value?.currentStatus === "idle"
);
const canSendMessage = computed(
  () => isAgentIdle.value && message.value.trim()
);

onMounted(() => {
  textareaRef.value?.focus();
});

const handleSend = () => {
  if (!canSendMessage.value) {
    return;
  }

  const messageToSend = message.value.trim();
  message.value = "";
  sendMessage(messageToSend);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};

const models = [
  {
    label: "Claude",
    items: [
      {
        name: "Claude 3.5 Sonnet",
        isRecommended: true,
        id: "anthropic/claude-sonnet-3-5-sonnet",
      },
      { name: "Claude 4 Sonnet", id: "anthropic/claude-sonnet-4" },
    ],
  },
  {
    label: "Gemini",
    items: [
      {
        name: "Gemini 2.5 Pro",
        isRecommended: true,
        id: "google/gemini-2.5-pro",
      },
      { name: "Gemini 2.5 Flash", id: "google/gemini-2.5-flash" },
      {
        name: "Gemini 2.5 Flash Lite",
        id: "google/gemini-2.5-flash-lite-preview-06-17",
      },
      { name: "Gemini 2.0 Flash", id: "google/gemini-2.0-flash-001" },
    ],
  },
  {
    label: "GPT",
    items: [
      { name: "GPT 4.1", isRecommended: true, id: "openai/gpt-4.1" },
      { name: "GPT o4 Mini High", id: "openai/o4-mini-high" },
    ],
  },
];
</script>

<template>
  <div
    class="p-4 bg-surface-900 h-40 flex flex-col gap-2 border-t border-surface-700"
  >
    <textarea
      ref="textareaRef"
      v-model="message"
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
        v-model="selectedModel"
        :options="models"
        option-label="name"
        option-value="name"
        option-group-label="label"
        option-group-children="items"
        class="text-sm font-mono"
      >
        <template #option="slotProps">
          <div class="flex items-center justify-between w-full">
            <span>{{ slotProps.option.name }}</span>
            <i
              v-if="slotProps.option.isRecommended"
              class="fas fa-star text-secondary-400 text-xs ml-2"
              title="This model is recommended"
            />
          </div>
        </template>
      </Select>

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
</template>
