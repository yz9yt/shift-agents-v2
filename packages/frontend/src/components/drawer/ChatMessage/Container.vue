<script setup lang="ts">
import { UIMessage } from "ai";
import { toRefs } from "vue";

const props = defineProps<{ message: UIMessage }>();

const { message } = toRefs(props);
</script>

<template>
  <pre>{{ JSON.stringify(message, null, 2) }}</pre>
</template>
