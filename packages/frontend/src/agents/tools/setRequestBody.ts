import { ToolContext } from "@/agents/types";
import { tool } from "ai";
import { z } from "zod";
import { HttpForge } from "ts-http-forge";

const SetRequestBodySchema = z.object({
  body: z.string().describe(
    "The request body content (JSON, form data, raw text, etc.)",
  ),
});

export const setRequestBodyTool = tool({
  description:
    "Replace the entire request body content. Use this to send JSON data, form data, XML, or any other payload format for POST/PUT requests or testing purposes.",
  inputSchema: SetRequestBodySchema,
  execute: async (input, { experimental_context }) => {
    const context = experimental_context as ToolContext;
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft).body(input.body).build();
      });

      return {
        message: hasChanged ? "Request has been updated" : "Request has not changed",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to set body: ${message}` };
    }
  },
});


