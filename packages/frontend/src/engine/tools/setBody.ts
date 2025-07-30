import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetBodySchema = z.object({
  body: z.string(),
});

type SetBodyArgs = z.infer<typeof SetBodySchema>;
export const setBody: ToolFunction<SetBodyArgs, string> = {
  name: "setBody",
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
        return HttpForge.create(draft)
          .body(args.body)
          .build();
      });

      return "Request has been updated";
    } catch (error) {
      return `Failed to set body: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
