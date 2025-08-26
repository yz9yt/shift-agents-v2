// modified by Albert.C Date 2025-08-22 Version 0.03
<script setup lang="ts">
import Card from "primevue/card";
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import { OpenRouterContainer } from "./openrouter";
import { PromptsContainer } from "./prompts";
import Documentation from "./Documentation.vue";
import ErrorLog from "./ErrorLog.vue";
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
            <h3 class="text-lg font-semibold">Shift Agents v2</h3>
            <p class="text-sm text-surface-300">
              Shift Agents is a tool that allows you to delegate replay sessions
              into agent hands
            </p>
          </div>
        </div>
      </template>
    </Card>

    <div class="flex-1 flex flex-col gap-1 overflow-y-auto">
      <TabView class="flex-1" :pt="{
        panelContainer: { class: 'p-0 h-full' },
        navContainer: { class: 'pb-0' },
        nav: { class: 'px-4' },
      }">
        <TabPanel header="General Settings">
           <div class="flex-col h-full gap-1 overflow-y-auto">
             <OpenRouterContainer />
           </div>
        </TabPanel>
        <TabPanel header="Custom Prompts">
          <div class="flex-col h-full gap-1 overflow-y-auto">
            <PromptsContainer />
          </div>
        </TabPanel>
        <TabPanel header="Documentation">
          <div class="flex-col h-full gap-1 overflow-y-auto">
            <Documentation />
          </div>
        </TabPanel>
        <TabPanel header="Error Log">
          <div class="flex-col h-full gap-1 overflow-y-auto">
            <ErrorLog />
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>
