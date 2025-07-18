import { z } from "zod";

import type { ToolFunction } from "../types";

const RemoveQueryParameterSchema = z.object({
  name: z.string().min(1),
});

type RemoveQueryParameterArgs = z.infer<typeof RemoveQueryParameterSchema>;
export const removeQueryParameter: ToolFunction<
  RemoveQueryParameterArgs,
  string
> = {
  schema: RemoveQueryParameterSchema,
  description: "Remove a query parameter with the given name",
  handler: (args, context) => {
    try {
      const hasChanged = context.replaySession.updateRequestRaw((draft) => {
        const lines = draft.split("\r\n");
        if (lines.length === 0 || lines[0] === undefined) {
          throw new Error("Invalid HTTP request - empty request");
        }
        const [method, path, protocol] = lines[0].split(" ");
        if (path === undefined) {
          throw new Error("Invalid HTTP request - no path found");
        }
        const [basePath, queryString] = path.split("?");

        if (queryString === undefined) {
          return draft;
        }

        const params = queryString.split("&").filter((param) => {
          const [name] = param.split("=");
          return name !== args.name;
        });

        const newPath =
          params.length > 0 ? `${basePath}?${params.join("&")}` : basePath;

        return `${method} ${newPath} ${protocol}\r\n${lines
          .slice(1)
          .join("\r\n")}`;
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed. No query parameter found to remove.";
    } catch (error) {
      return `Failed to remove query parameter: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
