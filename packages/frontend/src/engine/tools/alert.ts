import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const AlertSchema = z.object({
  message: z.string().min(1),
});

type AlertArgs = z.infer<typeof AlertSchema>;

export const alert: ToolFunction<AlertArgs, string> = {
  name: "alert",
  schema: AlertSchema,
  description: "Show a browser alert with the given message",
  frontend: {
    icon: "fas fa-exclamation-triangle",
    message: () => `Alerted the user`,
  },
  handler: (args) => {
    window.alert(args.message);
    return "Alert displayed";
  },
};
