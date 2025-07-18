import { z } from "zod";
import type { ToolFunction, BaseToolResult, Finding } from "../types";

const AddFindingSchema = z.object({
  title: z.string().min(1),
  markdown: z.string().min(1),
});

type AddFindingArgs = z.infer<typeof AddFindingSchema>;

export const addFinding: ToolFunction<AddFindingArgs, BaseToolResult> = {
  schema: AddFindingSchema,
  description: "Add a finding with a title and markdown description",
  handler: async (args, context) => {
    try {
      const finding: Finding = {
        title: args.title,
        markdown: args.markdown,
      };

      return {
        kind: "Success",
        data: {
          newRequestRaw: context.replaySessionRequestRaw,
          findings: [finding],
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          error: `Failed to add finding: ${error instanceof Error ? error.message : String(error)}`,
        },
      };
    }
  },
};
