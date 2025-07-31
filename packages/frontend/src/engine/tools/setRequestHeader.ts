import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetRequestHeaderSchema = z.object({
  name: z.string().min(1).describe("The header name (e.g., Authorization, Content-Type, User-Agent)"),
  value: z.string().describe("The header value"),
});

type SetRequestHeaderArgs = z.infer<typeof SetRequestHeaderSchema>;

export const setRequestHeader: ToolFunction<SetRequestHeaderArgs, string> = {
  name: "setRequestHeader",
  schema: SetRequestHeaderSchema,
  description:
    "Add or update an HTTP header in the current request. Use this to set authentication tokens, content types, user agents, or any other HTTP headers needed for testing. If the header exists, it will be replaced.",
  frontend: {
    icon: "fas fa-edit",
    message: ({ name, value }) => `Set a header ${name} to ${value}`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .setHeader(args.name, args.value)
          .build();
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set header: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
