<script setup lang="ts">
import None from "./None.vue";
import Success from "./Success.vue";
import { useContent } from "./useContent";

import BadState from "@/components/drawer/ChatContent/BadState.vue";

const { hasMessages, hasSelectedAgent } = useContent();
</script>

<template>
  <BadState v-if="!hasSelectedAgent" />
  <None v-else-if="!hasMessages" />
  <Success v-else />
</template>
