import { z } from "zod";

import type { ToolFunction } from "../types";

const SetHeaderSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
});

type SetHeaderArgs = z.infer<typeof SetHeaderSchema>;

export const setHeader: ToolFunction<SetHeaderArgs, string> = {
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
        const lines = draft.split("\r\n");
        const headerEnd = lines.findIndex((line) => line === "");
        if (headerEnd === -1) {
          throw new Error(
            "Invalid HTTP request - no header/body separator found",
          );
        }

        const headers = lines.slice(0, headerEnd);
        const rest = lines.slice(headerEnd);

        // Find position of existing header if it exists
        const existingHeaderIndex = headers.findIndex((line) => {
          const [headerName] = line.split(":");
          return headerName?.toLowerCase() === args.name.toLowerCase();
        });

        // Create new headers array
        const newHeaders = [...headers];
        const newHeaderLine = `${args.name}: ${args.value}`;

        if (existingHeaderIndex >= 0) {
          newHeaders[existingHeaderIndex] = newHeaderLine;
        } else {
          newHeaders.push(newHeaderLine);
        }

        return [...newHeaders, ...rest].join("\r\n");
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
