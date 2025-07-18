import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const MatchAndReplaceSchema = z.object({
  rawRequest: z.string(),
  match: z.string().min(1),
  replace: z.string(),
});

type MatchAndReplaceArgs = z.infer<typeof MatchAndReplaceSchema>;

export const matchAndReplace: ToolFunction<
  MatchAndReplaceArgs,
  BaseToolResult
> = {
  schema: MatchAndReplaceSchema,
  description: "Match and replace text content",
  handler: async (args) => {
    try {
      const replaced = args.rawRequest.replace(args.match, args.replace);

      return {
        kind: "Success",
        data: {
          newRequestRaw: replaced,
          findings: `Matched "${args.match}" and replaced with "${args.replace}"`,
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          error: `Failed to match and replace: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
