import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const RemoveQueryParameterSchema = z.object({
  name: z.string().min(1),
});

type RemoveQueryParameterArgs = z.infer<typeof RemoveQueryParameterSchema>;
export const removeQueryParameter: ToolFunction<
  RemoveQueryParameterArgs,
  string
> = {
  name: "removeQueryParameter",
  schema: RemoveQueryParameterSchema,
  description: "Remove a query parameter with the given name",
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
