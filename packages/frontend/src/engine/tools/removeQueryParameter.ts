import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const RemoveQueryParameterSchema = BaseToolArgsSchema.extend({
  name: z.string().min(1),
});

type RemoveQueryParameterArgs = z.infer<typeof RemoveQueryParameterSchema>;

export const removeQueryParameter: ToolFunction<RemoveQueryParameterArgs, BaseToolResult> = {
  schema: RemoveQueryParameterSchema,
  description: "Remove a query parameter with the given name",
  handler: async (args) => {
    try {
      // TODO: Implement actual remove query parameter functionality
      console.log(`Removing query parameter: "${args.name}"`);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Query parameter "${args.name}" removed`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to remove query parameter: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 