import { tool } from "ai";
import { z } from "zod";

import { type ToolContext } from "@/agents/types";

const AddTodoSchema = z.object({
  id: z.string().min(1),
  content: z
    .string()
    .min(1)
    .describe("The content of the todo item. Keep it short and concise."),
  status: z.enum(["pending", "completed"]).default("pending"),
});

export const addTodoTool = tool({
  description: "Add a new todo item to the todo list",
  inputSchema: AddTodoSchema,
  execute: (input, { experimental_context }) => {
    const context = experimental_context as ToolContext;
    const todo = { id: input.id, content: input.content, status: input.status };
    context.todoManager.addTodo(todo);
    return { message: "Todo item added successfully", todo };
  },
});
