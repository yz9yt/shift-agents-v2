<script setup lang="ts">
import Card from "primevue/card";

import { OpenRouterContainer } from "./openrouter";
import { PromptsContainer } from "./prompts";
</script>

<template>
  <div class="flex flex-col h-full gap-1 overflow-hidden">
    <Card
      class="h-fit"
      :pt="{
        body: { class: 'h-fit p-0' },
        content: { class: 'h-fit flex flex-col' },
      }"
    >
      <template #content>
        <div class="flex justify-between items-center p-4">
          <div>
            <h3 class="text-lg font-semibold">Shift Agents</h3>
            <p class="text-sm text-surface-300">
              Shift Agents is a tool that allows you to delegate replay sessions
              into agent hands
            </p>
          </div>
        </div>
      </template>
    </Card>

    <div class="flex flex-col h-full gap-1 overflow-hidden">
      <Card
        class="h-1/2"
        :pt="{
          body: { class: 'h-full p-0' },
          content: { class: 'h-full flex flex-col overflow-hidden' },
        }"
      >
        <template #content>
          <PromptsContainer />
        </template>
      </Card>

      <Card
        class="h-1/2 min-h-fit"
        :pt="{
          body: { class: 'h-full p-0' },
          content: { class: 'h-full flex flex-col' },
        }"
      >
        <template #content>
          <OpenRouterContainer />
        </template>
      </Card>
    </div>
  </div>
</template>
