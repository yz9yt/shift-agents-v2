import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const RemoveRequestQuerySchema = z.object({
  name: z.string().min(1).describe("The query parameter name to remove from the request URL"),
});

type RemoveRequestQueryArgs = z.infer<typeof RemoveRequestQuerySchema>;
export const removeRequestQuery: ToolFunction<
  RemoveRequestQueryArgs,
  string
> = {
  name: "removeRequestQuery",
  schema: RemoveRequestQuerySchema,
  description: "Remove a query parameter from the current HTTP request URL. Use this to eliminate unwanted parameters, test behavior without specific query data, or simplify requests.",
  frontend: {
    icon: "fas fa-edit",
    message: ({ name }) => `Removed query parameter ${name} from the request`,
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .removeQueryParam(args.name)
          .build();
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed. No query parameter found to remove.";
    } catch (error) {
      return `Failed to remove query parameter: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
