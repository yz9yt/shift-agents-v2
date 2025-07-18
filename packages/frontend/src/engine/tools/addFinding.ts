import { z } from "zod";

import type { ToolFunction } from "../types";

const AddFindingSchema = z.object({
  title: z.string().min(1),
  markdown: z.string().min(1),
});

type AddFindingArgs = z.infer<typeof AddFindingSchema>;

export const addFinding: ToolFunction<AddFindingArgs, string> = {
  schema: AddFindingSchema,
  description: "Add a finding with a title and markdown description",
  handler: ({ title, markdown }, context) => {
    try {
      // TODO: We need to find a way to get the correct requestId from the currentReplayRequest.For now, using replaySessionID even tho that's wrong.
      context.sdk.findings.createFinding(context.replaySession.id.toString(), {
        title,
        description: markdown,
        reporter: "Shift Agent: " + context.agent.name,
      });

      return "Finding added";
    } catch (error) {
      return `Failed to add finding: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
