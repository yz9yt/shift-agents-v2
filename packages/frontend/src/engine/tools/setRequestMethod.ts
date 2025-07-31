import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetRequestMethodSchema = z.object({
  method: z.string().min(1).describe("The HTTP method to set (e.g., GET, POST, PUT, DELETE)"),
});

type SetRequestMethodArgs = z.infer<typeof SetRequestMethodSchema>;

export const setRequestMethod: ToolFunction<SetRequestMethodArgs, string> = {
  name: "setRequestMethod",
  schema: SetRequestMethodSchema,
  description: "Change the HTTP method of the current request (GET, POST, PUT, DELETE, etc.). Use this when you need to test different HTTP verbs or modify the request method for testing purposes.",
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
