import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const UpdateTodoSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).optional(),
  status: z.enum(["pending", "completed"]).optional(),
});

type UpdateTodoArgs = z.infer<typeof UpdateTodoSchema>;

export const updateTodo: ToolFunction<UpdateTodoArgs, string> = {
  name: "updateTodo",
  schema: UpdateTodoSchema,
  description: "Update an existing todo item by ID",
  frontend: {
    icon: "fas fa-edit",
    message: (args) => `Updated todo item: ${args.id}`,
  },
  handler: (args, context) => {
    const todos = context.todoManager.getTodos();
    const existingTodo = todos.find((todo) => todo.id === args.id);

    if (!existingTodo) {
      throw new Error(`Todo with ID ${args.id} not found`);
    }

    const updatedTodo = {
      ...existingTodo,
      ...(args.content !== undefined && { content: args.content }),
      ...(args.status !== undefined && { status: args.status }),
    };

    context.todoManager.updateTodo(args.id, updatedTodo);
    return `Todo updated successfully: ${JSON.stringify(updatedTodo)}`;
  },
};
