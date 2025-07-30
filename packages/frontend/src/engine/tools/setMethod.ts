import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetMethodSchema = z.object({
  method: z.string().min(1),
});

type SetMethodArgs = z.infer<typeof SetMethodSchema>;

export const setMethod: ToolFunction<SetMethodArgs, string> = {
  name: "setMethod",
  schema: SetMethodSchema,
  description: "Set the request method",
  frontend: {
    icon: "fas fa-edit",
    message: ({ method }) => `Set the request method to ${method}`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .method(args.method)
          .build();
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set method: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
