import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetHeaderSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
});

type SetHeaderArgs = z.infer<typeof SetHeaderSchema>;

export const setHeader: ToolFunction<SetHeaderArgs, string> = {
  name: "setHeader",
  schema: SetHeaderSchema,
  description:
    "Set a request header with the given name and value. If header exists, it will be replaced. If header does not exist, it will be added.",
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
