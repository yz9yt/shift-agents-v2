import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const SetRawSchema = z.object({
  raw: z
    .string()
    .describe(
      "The raw HTTP request content to set. Use normal line breaks, not CRLF - it will be converted to CRLF by the system.",
    ),
});

type SetRawArgs = z.infer<typeof SetRawSchema>;

// TODO: figure out a better way, i tried adding `line` input parameter but AI models seem to be bad at counting lines
export const setRaw: ToolFunction<SetRawArgs, string> = {
  name: "setRaw",
  schema: SetRawSchema,
  description:
    "Set the entire raw HTTP request content. Use this rarely, only when you need to modify the request in a way that cannot be done with other tools.",
  frontend: {
    icon: "fas fa-edit",
    message: () => `Updated the raw HTTP request`,
    details: ({ raw }) => raw,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return args.raw.replace(/\n/g, '\r\n');
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set raw request: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
