import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const ReplaceRequestTextSchema = z.object({
  match: z.string().min(1).describe("The exact text string to find and replace"),
  replace: z.string().describe("The replacement text"),
});

type ReplaceRequestTextArgs = z.infer<typeof ReplaceRequestTextSchema>;

export const replaceRequestText: ToolFunction<ReplaceRequestTextArgs, string> = {
  name: "replaceRequestText",
  schema: ReplaceRequestTextSchema,
  description: "Find and replace specific text strings anywhere in the HTTP request (headers, body, path, etc.). Use this for precise string replacements when other specific tools don't cover your needs. Supports literal string matching only.",
  frontend: {
    icon: "fas fa-edit",
    message: () => `Replaced text in the request`,
    details: ({ match, replace }) =>
      `Replaced every occurence of "${match}" with "${replace}"`,
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
