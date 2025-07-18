import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const RemoveQueryParameterSchema = BaseToolArgsSchema.extend({
  name: z.string().min(1),
});

type RemoveQueryParameterArgs = z.infer<typeof RemoveQueryParameterSchema>;

export const removeQueryParameter: ToolFunction<RemoveQueryParameterArgs, BaseToolResult> = {
  schema: RemoveQueryParameterSchema,
  description: "Remove a query parameter with the given name",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split('\n');
      if (lines.length === 0 || !lines[0]) {
        throw new Error('Invalid HTTP request - empty request');
      }
      const [method, path, protocol] = lines[0].split(' ');
      if (!path) {
        throw new Error('Invalid HTTP request - no path found');
      }
      const [basePath, queryString] = path.split('?');
      let newRequest = args.rawRequest;
      if (!queryString) {
        return {
          success: true,
          currentRequestRaw: newRequest,
        };
      }

      const params = queryString.split('&').filter(param => {
        const [name] = param.split('=');
        return name !== args.name;
      });

      const newPath = params.length > 0 
        ? `${basePath}?${params.join('&')}`
        : basePath;

      newRequest = `${method} ${newPath} ${protocol}\n${lines.slice(1).join('\n')}`;
      
      return {
        success: true,
        currentRequestRaw: newRequest,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to remove query parameter: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 