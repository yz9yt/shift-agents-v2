import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetQueryParameterSchema = BaseToolArgsSchema.extend({
  name: z.string().min(1),
  value: z.string(),
});

type SetQueryParameterArgs = z.infer<typeof SetQueryParameterSchema>;

export const setQueryParameter: ToolFunction<SetQueryParameterArgs, BaseToolResult> = {
  schema: SetQueryParameterSchema,
  description: "Set a query parameter with the given name and value",
  handler: async (args) => {
    try {
      // TODO: Implement actual set query parameter functionality
      console.log(`Setting query parameter "${args.name}" to: "${args.value}"`);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Query parameter "${args.name}" set to: "${args.value}"`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set query parameter: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 