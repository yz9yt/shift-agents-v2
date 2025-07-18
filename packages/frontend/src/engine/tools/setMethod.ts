import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetMethodSchema = BaseToolArgsSchema.extend({
  method: z.string().min(1),
});

type SetMethodArgs = z.infer<typeof SetMethodSchema>;

export const setMethod: ToolFunction<SetMethodArgs, BaseToolResult> = {
  schema: SetMethodSchema,
  description: "Set the request method",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split('\n');
      if (lines.length === 0 || !lines[0]) {
        throw new Error('Invalid HTTP request - empty request');
      }

      const [method, path, protocol] = lines[0].split(' ');
      if (!method || !protocol || !path) {
        throw new Error('Invalid HTTP request - malformed request line');
      }

      const newRequest = `${args.method} ${path} ${protocol}\n${lines.slice(1).join('\n')}`;
      return {
        success: true,
        currentRequestRaw: newRequest,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set method: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 