import { computed } from "vue";

import { useAgentStore } from "@/stores/agent";

export const useTodos = () => {
  const agentStore = useAgentStore();

  const todos = computed(() => {
    if (!agentStore.selectedAgent) {
      return [];
    }

    return agentStore.selectedAgent.todoManager.getTodos();
  });

  const hasTodos = computed(() => todos.value.length > 0);

  const pendingTodos = computed(() =>
    todos.value.filter((todo) => todo.status === "pending"),
  );

  const completedTodos = computed(() =>
    todos.value.filter((todo) => todo.status === "completed"),
  );

  return {
    todos,
    hasTodos,
    pendingTodos,
    completedTodos,
  };
};
