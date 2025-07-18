import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetPathSchema = BaseToolArgsSchema.extend({
  path: z.string().min(1),
});

type SetPathArgs = z.infer<typeof SetPathSchema>;

export const setPath: ToolFunction<SetPathArgs, BaseToolResult> = {
  schema: SetPathSchema,
  description: "Set the request path",
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

      // Extract query parameters from original path if they exist
      const queryString = path.includes('?') ? path.split('?')[1] : '';
      
      // Construct new path, preserving query parameters if they exist
      const newPath = queryString ? `${args.path}?${queryString}` : args.path;
      
      // Construct new request with updated path
      const newRequest = `${method} ${newPath} ${protocol}\n${lines.slice(1).join('\n')}`;

      return {
        success: true,
        currentRequestRaw: newRequest,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set path: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 