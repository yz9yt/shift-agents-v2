import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const RemoveHeaderSchema = z.object({
  name: z.string().min(1),
});

type RemoveHeaderArgs = z.infer<typeof RemoveHeaderSchema>;

export const removeHeader: ToolFunction<RemoveHeaderArgs, string> = {
  name: "removeHeader",
  schema: RemoveHeaderSchema,
  description: "Remove a request header with the given name",
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
