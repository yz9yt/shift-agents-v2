import { z } from "zod";

import type { ToolFunction } from "../types";

const PauseSchema = z.object({});
type PauseArgs = z.infer<typeof PauseSchema>;

export const pause: ToolFunction<PauseArgs, string> = {
  schema: PauseSchema,
  description: "Pause the current execution",
  handler: () => {
    return "Paused";
  },
};
