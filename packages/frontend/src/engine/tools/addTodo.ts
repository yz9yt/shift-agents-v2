import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const AddTodoSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(["pending", "completed"]).default("pending"),
});

type AddTodoArgs = z.infer<typeof AddTodoSchema>;

export const addTodo: ToolFunction<AddTodoArgs, string> = {
  name: "addTodo",
  schema: AddTodoSchema,
  description: "Add a new todo item to the todo list",
  frontend: {
    icon: "fas fa-plus",
    message: (args) => `Added todo item: ${args.content}`,
  },
  handler: (args, context) => {
    const todo = {
      id: args.id,
      content: args.content,
      status: args.status,
    };

    context.todoManager.addTodo(todo);
    return `Todo item added successfully: ${JSON.stringify(todo)}`;
  },
};
