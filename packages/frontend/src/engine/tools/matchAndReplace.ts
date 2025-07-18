import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const MatchAndReplaceSchema = BaseToolArgsSchema.extend({
  match: z.string().min(1),
  replace: z.string(),
});

type MatchAndReplaceArgs = z.infer<typeof MatchAndReplaceSchema>;

export const matchAndReplace: ToolFunction<MatchAndReplaceArgs, BaseToolResult> = {
  schema: MatchAndReplaceSchema,
  description: "Match and replace text content",
  handler: async (args) => {
    try {
      const replaced = args.rawRequest.replace(args.match, args.replace);
      
      return {
        success: true,
        currentRequestRaw: replaced
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to match and replace: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 