import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetMethodSchema = BaseToolArgsSchema.extend({
  method: z.string().min(1),
});

type SetMethodArgs = z.infer<typeof SetMethodSchema>;

export const setMethod: ToolFunction<SetMethodArgs, BaseToolResult> = {
  schema: SetMethodSchema,
  description: "Set the request method",
  handler: async (args) => {
    try {
      // TODO: Implement actual set method functionality
      console.log(`Setting method to: "${args.method}"`);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Request method set to: "${args.method}"`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set method: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 