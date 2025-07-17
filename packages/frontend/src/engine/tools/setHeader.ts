import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetHeaderSchema = BaseToolArgsSchema.extend({
  name: z.string().min(1),
  value: z.string(),
});

type SetHeaderArgs = z.infer<typeof SetHeaderSchema>;

export const setHeader: ToolFunction<SetHeaderArgs, BaseToolResult> = {
  schema: SetHeaderSchema,
  description: "Set a request header with the given name and value",
  handler: async (args) => {
    try {
      // TODO: Implement actual set header functionality
      console.log(`Setting header "${args.name}" to: "${args.value}"`);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Header "${args.name}" set to: "${args.value}"`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set header: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 