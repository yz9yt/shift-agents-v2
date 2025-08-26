// modified by Albert.C Date 2025-08-22 Version 0.01
import { tool } from "ai";
import { z } from "zod";

import { type ToolContext } from "@/agents/types";

const GetHttpHistorySchema = z.object({
  query: z
    .string()
    .min(1)
    .describe("The query to search the HTTP history for. It can be a domain, endpoint, or a specific value."),
  limit: z
    .number()
    .optional()
    .describe("The maximum number of results to return. Defaults to 10."),
});

export const getHttpHistoryTool = tool({
  description:
    "Search the HTTP history of the current Caido project for relevant requests and responses. Use this to get context about the application's behavior and find information like session IDs, API endpoints, or user data.",
  inputSchema: GetHttpHistorySchema,
  execute: async (input, { experimental_context }) => {
    const context = experimental_context as ToolContext;
    try {
      // Placeholder for future implementation
      return {
        results: [
          {
            request: "GET /api/users/123",
            response: "HTTP/1.1 200 OK",
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to get HTTP history: ${message}` };
    }
  },
});
