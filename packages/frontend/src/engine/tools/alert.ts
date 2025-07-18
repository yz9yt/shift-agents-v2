import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const AlertSchema = z.object({
  message: z.string().min(1),
});

type AlertArgs = z.infer<typeof AlertSchema>;

export const alert: ToolFunction<AlertArgs, BaseToolResult> = {
  schema: AlertSchema,
  description: "Show a browser alert with the given message",
  handler: async (args) => {
    window.alert(args.message);

    return {
      kind: "Success",
      data: {
        newRequestRaw: "",
        findings: `Alert displayed with message: "${args.message}"`,
      },
    };
  },
};
