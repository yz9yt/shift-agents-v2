import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const RemoveHeaderSchema = BaseToolArgsSchema.extend({
  name: z.string().min(1),
});

type RemoveHeaderArgs = z.infer<typeof RemoveHeaderSchema>;

export const removeHeader: ToolFunction<RemoveHeaderArgs, BaseToolResult> = {
  schema: RemoveHeaderSchema,
  description: "Remove a request header with the given name",
  handler: async (args) => {
    try {
      // TODO: Implement actual remove header functionality
      console.log(`Removing header: "${args.name}"`);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Header "${args.name}" removed`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to remove header: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 