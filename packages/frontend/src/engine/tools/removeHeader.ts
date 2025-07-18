import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const RemoveHeaderSchema = z.object({
  name: z.string().min(1),
  rawRequest: z.string(),
});

type RemoveHeaderArgs = z.infer<typeof RemoveHeaderSchema>;

export const removeHeader: ToolFunction<RemoveHeaderArgs, BaseToolResult> = {
  schema: RemoveHeaderSchema,
  description: "Remove a request header with the given name",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split("\r\n");
      const headerEnd = lines.findIndex((line) => line === "");
      if (headerEnd === -1) {
        throw new Error(
          "Invalid HTTP request - no header/body separator found"
        );
      }

      const headers = lines.slice(0, headerEnd);
      const rest = lines.slice(headerEnd);

      const filteredHeaders = headers.filter((line) => {
        const [headerName] = line.split(":");
        return headerName?.toLowerCase() !== args.name.toLowerCase();
      });

      const newRequest = [...filteredHeaders, ...rest].join("\r\n");
      return {
        kind: "Success",
        data: {
          newRequestRaw: newRequest,
          findings: `Header "${args.name}" removed`,
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          error: `Failed to remove header: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
