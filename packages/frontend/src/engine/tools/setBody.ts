import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetBodySchema = BaseToolArgsSchema.extend({
  body: z.string(),
});

type SetBodyArgs = z.infer<typeof SetBodySchema>;

export const setBody: ToolFunction<SetBodyArgs, BaseToolResult> = {
  schema: SetBodySchema,
  description: "Set the request body content",
  handler: async (args) => {
    try {
      // TODO: Implement actual body setting functionality
      console.log(`Setting body to: "${args.body}"`);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Request body set to: "${args.body}"`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set body: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 