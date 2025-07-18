import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";
import { BaseToolArgsSchema } from "../types";

const AddFindingSchema = BaseToolArgsSchema.extend({
  title: z.string().min(1),
  markdown: z.string().min(1),
});

type AddFindingArgs = z.infer<typeof AddFindingSchema>;

export const addFinding: ToolFunction<AddFindingArgs, BaseToolResult> = {
  schema: AddFindingSchema,
  description: "Add a finding with a title and markdown description",
  handler: async (args) => {
    try {
      const finding = `**${args.title}**\n\n${args.markdown}`;
      
      return {
        success: true,
        currentRequestRaw: args.rawRequest,
        findings: finding,
      };
    } catch (error) {
      return {
        success: false,
        currentRequestRaw: args.rawRequest,
        error: `Failed to add finding: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
}; 