import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const PauseSchema = z.object({});
type PauseArgs = z.infer<typeof PauseSchema>;

export const pause: ToolFunction<PauseArgs, string> = {
  name: "pause",
  schema: PauseSchema,
  description:
    "Once you have finished your work, you can use this tool to pause the execution of the agent.",
  frontend: {
    icon: "fas fa-pause",
    message: () => `Paused the agent`,
  },
  handler: () => {
    return "Paused";
  },
};
