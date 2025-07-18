import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore("stores.config", () => {
  const openRouterApiKey = ref<string>("");

  const setOpenRouterApiKey = (key: string) => {
    openRouterApiKey.value = key;
  };

  return {
    openRouterApiKey,
    setOpenRouterApiKey,
  };
});
