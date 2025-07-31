import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetRequestPathSchema = z.object({
  path: z.string().min(1).describe("The URL path to set (e.g., /api/users, /admin/login). This will modify the first line of the request, so note to not use uncommon chars like spaces or newlines."),
});

type SetRequestPathArgs = z.infer<typeof SetRequestPathSchema>;

export const setRequestPath: ToolFunction<SetRequestPathArgs, string> = {
  name: "setRequestPath",
  schema: SetRequestPathSchema,
  description: "Change the URL path of the current request. Use this to test different endpoints, access restricted paths, or modify the target resource being requested.",
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
