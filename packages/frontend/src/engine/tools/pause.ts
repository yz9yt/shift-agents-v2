import { z } from "zod";

import type { ToolFunction } from "../types";

const PauseSchema = z.object({});
type PauseArgs = z.infer<typeof PauseSchema>;

export const pause: ToolFunction<PauseArgs, string> = {
  schema: PauseSchema,
  description: "Once you have finished your work, you can use this tool to pause the execution of the agent.",
  handler: () => {
    return "Paused";
  },
};
