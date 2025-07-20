import { z } from "zod";

import type { ToolFunction } from "../types";

const MatchAndReplaceSchema = z.object({
  match: z.string().min(1),
  replace: z.string(),
});

type MatchAndReplaceArgs = z.infer<typeof MatchAndReplaceSchema>;

export const matchAndReplace: ToolFunction<MatchAndReplaceArgs, string> = {
  schema: MatchAndReplaceSchema,
  description: "Match and replace text content",
  frontend: {
    icon: "fas fa-edit",
    message: () => `Replaced text in the request`,
    details: ({ match, replace }) => `Replaced every occurence of "${match}" with "${replace}"`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return draft.replace(args.match, args.replace);
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed. No replacements were made.";
    } catch (error) {
      return `Failed to match and replace: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
