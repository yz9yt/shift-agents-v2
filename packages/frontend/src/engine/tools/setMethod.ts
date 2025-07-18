import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const SetMethodSchema = z.object({
  rawRequest: z.string(),
  method: z.string().min(1),
});

type SetMethodArgs = z.infer<typeof SetMethodSchema>;

export const setMethod: ToolFunction<SetMethodArgs, BaseToolResult> = {
  schema: SetMethodSchema,
  description: "Set the request method",
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

      const newRequest = `${args.method} ${path} ${protocol}\r\n${lines
        .slice(1)
        .join("\r\n")}`;
      return {
        kind: "Success",
        data: {
          newRequestRaw: newRequest,
          findings: [
            {
              title: `Request method set to: "${args.method}"`,
              markdown: `Request method set to: "${args.method}"`,
            },
          ],
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          currentRequestRaw: args.rawRequest,
          error: `Failed to set method: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
