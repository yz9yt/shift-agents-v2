import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetQueryParameterSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
});

type SetQueryParameterArgs = z.infer<typeof SetQueryParameterSchema>;

export const setQueryParameter: ToolFunction<SetQueryParameterArgs, string> = {
  name: "setQueryParameter",
  schema: SetQueryParameterSchema,
  description: "Set a query parameter with the given name and value",
  frontend: {
    icon: "fas fa-edit",
    message: ({ name, value }) => `Set a query parameter ${name} to ${value}`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .upsertQueryParam(args.name, args.value)
          .build();
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set query parameter: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
