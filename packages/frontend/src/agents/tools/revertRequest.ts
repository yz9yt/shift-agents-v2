// modified by Albert.C Date 2025-08-22 Version 0.01
import { tool } from "ai";
import { z } from "zod";

import { type ToolContext } from "@/agents/types";

const RevertRequestSchema = z.object({});

export const revertRequestTool = tool({
  description: "Revert the current HTTP request to the previous state.",
  inputSchema: RevertRequestSchema,
  execute: (input, { experimental_context }) => {
    const context = experimental_context as ToolContext;
    try {
      const hasChanged = context.replaySession.revertRequestRaw();

      return {
        message: hasChanged
          ? "Request has been reverted to the previous state"
          : "Request has not changed, no previous state found",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: `Failed to revert request: ${message}` };
    }
  },
});
