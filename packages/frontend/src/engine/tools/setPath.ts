import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetPathSchema = z.object({
  path: z.string().min(1),
});

type SetPathArgs = z.infer<typeof SetPathSchema>;

export const setPath: ToolFunction<SetPathArgs, string> = {
  name: "setPath",
  schema: SetPathSchema,
  description: "Set the request path",
  frontend: {
    icon: "fas fa-edit",
    message: ({ path }) => `Set the request path to ${path}`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .path(args.path)
          .build();
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set path: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
