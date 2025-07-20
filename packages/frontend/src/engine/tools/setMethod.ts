import { z } from "zod";

import type { ToolFunction } from "../types";

const SetMethodSchema = z.object({
  method: z.string().min(1),
});

type SetMethodArgs = z.infer<typeof SetMethodSchema>;

export const setMethod: ToolFunction<SetMethodArgs, string> = {
  schema: SetMethodSchema,
  description: "Set the request method",
  frontend: {
    icon: "fas fa-edit",
    message: ({ method }) => `Set the request method to ${method}`
  },
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        const lines = draft.split("\r\n");
        if (lines.length === 0 || lines[0] === undefined) {
          throw new Error("Invalid HTTP request - empty request");
        }

        const [method, path, protocol] = lines[0].split(" ");
        if (
          method === undefined ||
          protocol === undefined ||
          path === undefined
        ) {
          throw new Error("Invalid HTTP request - malformed request line");
        }

        return `${args.method} ${path} ${protocol}\r\n${lines
          .slice(1)
          .join("\r\n")}`;
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set method: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
