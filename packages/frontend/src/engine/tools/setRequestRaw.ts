import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const SetRequestRawSchema = z.object({
  raw: z
    .string()
    .describe(
      "The raw HTTP request content to set. Use normal line breaks, not CRLF - it will be converted to CRLF by the system.",
    ),
});

type SetRequestRawArgs = z.infer<typeof SetRequestRawSchema>;

// TODO: figure out a better way, i tried adding `line` input parameter but AI models seem to be bad at counting lines
export const setRequestRaw: ToolFunction<SetRequestRawArgs, string> = {
  name: "setRequestRaw",
  schema: SetRequestRawSchema,
  description:
    "Replace the entire raw HTTP request with custom content. This is an advanced tool - use this only when you need to craft malformed requests, test HTTP parsing vulnerabilities, or make modifications that other tools cannot handle.",
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
