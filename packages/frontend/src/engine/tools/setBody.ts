import { z } from "zod";

import type { ToolFunction } from "../types";

const SetBodySchema = z.object({
  body: z.string(),
});

type SetBodyArgs = z.infer<typeof SetBodySchema>;
export const setBody: ToolFunction<SetBodyArgs, string> = {
  schema: SetBodySchema,
  description: "Set the request body content",
  frontend: {
    icon: "fas fa-edit",
    message: () => `Updated the request body`,
    details: ({ body }) => body,
  },
  handler: (args, context) => {
    try {
      context.replaySession.updateRequestRaw((draft) => {
        const lines = draft.split("\r\n");
        const headerEnd = lines.findIndex((line, index) => {
          return line === "" && lines[index + 1] === "";
        });

        if (headerEnd === -1) {
          throw new Error(
            "Invalid HTTP request - no double newline separator found",
          );
        }

        // Keep headers up to the double newline
        const headers = lines.slice(0, headerEnd + 1).join("\r\n");

        // Replace everything after the double newline with new body
        return `${headers}\r\n${args.body}`;
      });

      return "Request has been updated";
    } catch (error) {
      return `Failed to set body: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
