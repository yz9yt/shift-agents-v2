import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const SetPathSchema = z.object({
  path: z.string().min(1),
});

type SetPathArgs = z.infer<typeof SetPathSchema>;

export const setPath: ToolFunction<SetPathArgs, string> = {
  name: "setPath",
  schema: SetPathSchema,
  description: "Set the request path",
  frontend: {
    icon: "fas fa-edit",
    message: ({ path }) => `Set the request path to ${path}`,
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

        const queryString = path.includes("?") ? path.split("?")[1] : "";

        const newPath =
          queryString !== "" ? `${args.path}?${queryString}` : args.path;

        return `${method} ${newPath} ${protocol}\r\n${lines
          .slice(1)
          .join("\r\n")}`;
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set path: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
