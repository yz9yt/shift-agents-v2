// modified by Albert.C Date 2025-08-22 Version 0.01

import { ref } from "vue";

import { type Todo } from "@/agents/types";

export class TodoManager {
  private todos = ref<Todo[]>([]);

  constructor() {
    this.todos.value = [];
  }

  addTodo(todo: Todo) {
    this.todos.value.push(todo);
  }

  getTodos() {
    return this.todos.value;
  }

  removeTodo(id: string) {
    this.todos.value = this.todos.value.filter((todo) => todo.id !== id);
  }

  updateTodo(id: string, updatedTodo: Todo) {
    this.todos.value = this.todos.value.map((todo) =>
      todo.id === id ? updatedTodo : todo,
    );
  }

  completeTodo(id: string) {
    this.todos.value = this.todos.value.map((todo) =>
      todo.id === id ? { ...todo, status: "completed" } : todo,
    );
  }

  completeTodoByContent(content: string) {
    this.todos.value = this.todos.value.map((todo) =>
      todo.content === content ? { ...todo, status: "completed" } : todo,
    );
  }

  getPendingTodos() {
    return this.todos.value.filter((todo) => todo.status === "pending");
  }

  clearTodos() {
    this.todos.value = [];
  }
}
