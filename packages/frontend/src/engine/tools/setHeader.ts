import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const SetHeaderSchema = BaseToolArgsSchema.extend({
  name: z.string().min(1),
  value: z.string(),
});

type SetHeaderArgs = z.infer<typeof SetHeaderSchema>;

export const setHeader: ToolFunction<SetHeaderArgs, BaseToolResult> = {
  schema: SetHeaderSchema,
  description: "Set a request header with the given name and value",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split('\n');
      const headerEnd = lines.findIndex(line => line === '');
      if (headerEnd === -1) {
        throw new Error('Invalid HTTP request - no header/body separator found');
      }

      const headers = lines.slice(0, headerEnd);
      const rest = lines.slice(headerEnd);

      // Find position of existing header if it exists
      const existingHeaderIndex = headers.findIndex(line => {
        const [headerName] = line.split(':');
        return headerName?.toLowerCase() === args.name.toLowerCase();
      });

      // Create new headers array
      const newHeaders = [...headers];
      const newHeaderLine = `${args.name}: ${args.value}`;

      if (existingHeaderIndex >= 0) {
        // Replace at same position
        newHeaders[existingHeaderIndex] = newHeaderLine;
      } else {
        // Add to end of headers if not found
        newHeaders.push(newHeaderLine);
      }

      const newRequest = [...newHeaders, ...rest].join('\n');
      return {
        success: true,
        currentRequestRaw: newRequest
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to set header: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};