import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const RemoveRequestHeaderSchema = z.object({
  name: z.string().min(1).describe("The header name to remove from the request"),
});

type RemoveRequestHeaderArgs = z.infer<typeof RemoveRequestHeaderSchema>;

export const removeRequestHeader: ToolFunction<RemoveRequestHeaderArgs, string> = {
  name: "removeRequestHeader",
  schema: RemoveRequestHeaderSchema,
  description: "Remove an HTTP header from the current request. Use this to eliminate unwanted headers, remove authentication tokens, or test behavior without specific headers.",
  frontend: {
    icon: "fas fa-edit",
    message: ({ name }) => `Removed header ${name} from the request`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .removeHeader(args.name)
          .build();
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed. No header found to remove.";
    } catch (error) {
      return `Failed to remove header: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
