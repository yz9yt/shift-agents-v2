import { z } from "zod";

import type { ToolFunction } from "../types";

const RemoveHeaderSchema = z.object({
  name: z.string().min(1),
});

type RemoveHeaderArgs = z.infer<typeof RemoveHeaderSchema>;

export const removeHeader: ToolFunction<RemoveHeaderArgs, string> = {
  schema: RemoveHeaderSchema,
  description: "Remove a request header with the given name",
  frontend: {
    icon: "fas fa-edit",
    message: ({ name }) => `Removed header ${name} from the request`
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        const lines = draft.split("\r\n");
        const headerEnd = lines.findIndex((line) => line === "");
        if (headerEnd === -1) {
          throw new Error(
            "Invalid HTTP request - no header/body separator found",
          );
        }

        const headers = lines.slice(0, headerEnd);
        const rest = lines.slice(headerEnd);

        const filteredHeaders = headers.filter((line) => {
          const [headerName] = line.split(":");
          return headerName?.toLowerCase() !== args.name.toLowerCase();
        });

        return [...filteredHeaders, ...rest].join("\r\n");
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed. No header found to remove.";
    } catch (error) {
      return `Failed to remove header: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
