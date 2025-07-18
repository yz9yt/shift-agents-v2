<script setup lang="ts">
import { useContent } from "./useContent";
import None from "./None.vue";
import Success from "./Success.vue";
import BadState from "@/components/drawer/ChatContent/BadState.vue";

const { hasMessages, hasSelectedAgent } = useContent();
</script>

<template>
  <BadState v-if="!hasSelectedAgent" />
  <None v-else-if="!hasMessages" />
  <Success v-else />
</template>
