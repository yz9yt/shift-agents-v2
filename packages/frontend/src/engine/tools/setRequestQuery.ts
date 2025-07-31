import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetRequestQuerySchema = z.object({
  name: z.string().min(1).describe("The query parameter name"),
  value: z.string().describe("The query parameter value"),
});

type SetRequestQueryArgs = z.infer<typeof SetRequestQuerySchema>;

export const setRequestQuery: ToolFunction<SetRequestQueryArgs, string> = {
  name: "setRequestQuery",
  schema: SetRequestQuerySchema,
  description: "Add or update a query parameter in the current HTTP request URL. Use this when you need to modify GET parameters, add new ones, or change existing values. The parameter will be properly URL-encoded.",
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
