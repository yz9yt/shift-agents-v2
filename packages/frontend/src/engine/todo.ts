import { type Todo } from "@/engine/types";

export class TodoManager {
  private todos: Todo[] = [];

  constructor() {
    this.todos = [];
  }

  addTodo(todo: Todo) {
    this.todos.push(todo);
  }

  getTodos() {
    return this.todos;
  }

  removeTodo(id: string) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  updateTodo(id: string, updatedTodo: Todo) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? updatedTodo : todo,
    );
  }

  completeTodo(id: string) {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, status: "completed" } : todo,
    );
  }

  getPendingTodos() {
    return this.todos.filter((todo) => todo.status === "pending");
  }

  clearTodos() {
    this.todos = [];
  }
}
