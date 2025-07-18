import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const SetPathSchema = z.object({
  rawRequest: z.string(),
  path: z.string().min(1),
});

type SetPathArgs = z.infer<typeof SetPathSchema>;

export const setPath: ToolFunction<SetPathArgs, BaseToolResult> = {
  schema: SetPathSchema,
  description: "Set the request path",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split("\r\n");
      if (lines.length === 0 || !lines[0]) {
        throw new Error("Invalid HTTP request - empty request");
      }

      const [method, path, protocol] = lines[0].split(" ");
      if (!method || !protocol || !path) {
        throw new Error("Invalid HTTP request - malformed request line");
      }

      // Extract query parameters from original path if they exist
      const queryString = path.includes("?") ? path.split("?")[1] : "";

      // Construct new path, preserving query parameters if they exist
      const newPath = queryString ? `${args.path}?${queryString}` : args.path;

      // Construct new request with updated path
      const newRequest = `${method} ${newPath} ${protocol}\r\n${lines
        .slice(1)
        .join("\r\n")}`;

      return {
        kind: "Success",
        data: {
          newRequestRaw: newRequest,
          findings: [
            {
              title: `Request path set to: "${args.path}"`,
              markdown: `Request path set to: "${args.path}"`,
            },
          ],
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          currentRequestRaw: args.rawRequest,
          error: `Failed to set path: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
