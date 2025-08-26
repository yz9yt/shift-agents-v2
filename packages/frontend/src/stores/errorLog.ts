// modified by Albert.C Date 2025-08-22 Version 0.03
import { defineStore } from "pinia";
import { ref } from "vue";

type ErrorEntry = {
  agentId: string;
  message: string;
  timestamp: number;
};

export const useErrorLogStore = defineStore("stores.errorLog", () => {
  const errors = ref<ErrorEntry[]>([]);

  function addError(agentId: string, message: string) {
    errors.value.push({
      agentId,
      message,
      timestamp: Date.now(),
    });
  }
  
  function clearErrors() {
    errors.value = [];
  }

  return {
    errors,
    addError,
    clearErrors,
  };
});
