import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const PauseSchema = BaseToolArgsSchema.extend({});

type PauseArgs = z.infer<typeof PauseSchema>;

export const pause: ToolFunction<PauseArgs, BaseToolResult> = {
  schema: PauseSchema,
  description: "Pause the current execution",
  handler: async (args) => {
    return {
      success: true,
      currentRequestRaw: args.rawRequest,
      pause: true
    };
  },
}; 