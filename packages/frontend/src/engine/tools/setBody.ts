import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const SetBodySchema = z.object({
  rawRequest: z.string(),
  body: z.string(),
});

type SetBodyArgs = z.infer<typeof SetBodySchema>;

export const setBody: ToolFunction<SetBodyArgs, BaseToolResult> = {
  schema: SetBodySchema,
  description: "Set the request body content",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split("\r\n");
      const headerEnd = lines.findIndex((line, index) => {
        return line === "" && lines[index + 1] === "";
      });

      if (headerEnd === -1) {
        throw new Error(
          "Invalid HTTP request - no double newline separator found"
        );
      }

      // Keep headers up to the double newline
      const headers = lines.slice(0, headerEnd + 1).join("\r\n");

      // Replace everything after the double newline with new body
      const newRequest = `${headers}\r\n${args.body}`; // Not sure about the \r\n, we'll have to see how that works.

      return {
        kind: "Success",
        data: {
          newRequestRaw: newRequest,
          findings: [
            {
              title: `Request body set to: "${args.body}"`,
              markdown: `Request body set to: "${args.body}"`,
            },
          ],
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          currentRequestRaw: args.rawRequest,
          error: `Failed to set body: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
