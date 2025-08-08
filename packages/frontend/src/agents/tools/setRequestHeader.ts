import { ToolContext } from "@/agents/types";
import { tool } from "ai";
import { z } from "zod";
import { HttpForge } from "ts-http-forge";

const SetRequestHeaderSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe(
      "The header name (e.g., Authorization, Content-Type, User-Agent)",
    ),
  value: z.string().describe("The header value"),
});

export const setRequestHeaderTool = tool({
  description:
    "Add or update an HTTP header in the current request. Use this to set authentication tokens, content types, user agents, or any other HTTP headers needed for testing. If the header exists, it will be replaced.",
  inputSchema: SetRequestHeaderSchema,
  execute: async (input, { experimental_context }) => {
    const context = experimental_context as ToolContext;
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft).setHeader(input.name, input.value).build();
      });

      return {
        message: hasChanged ? "Request has been updated" : "Request has not changed",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to set header: ${message}` };
    }
  },
});


