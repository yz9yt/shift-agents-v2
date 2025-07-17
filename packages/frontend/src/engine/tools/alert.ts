import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const AlertSchema = BaseToolArgsSchema.extend({
  message: z.string().min(1),
});

type AlertArgs = z.infer<typeof AlertSchema>;

export const alert: ToolFunction<AlertArgs, BaseToolResult> = {
  schema: AlertSchema,
  description: "Show a browser alert with the given message",
  handler: async (args) => {
    try {
      // Show the alert
      window.alert(args.message);
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: `Alert displayed with message: "${args.message}"`,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to display alert: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
