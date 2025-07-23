import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const SetQueryParameterSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
});

type SetQueryParameterArgs = z.infer<typeof SetQueryParameterSchema>;

export const setQueryParameter: ToolFunction<SetQueryParameterArgs, string> = {
  name: "setQueryParameter",
  schema: SetQueryParameterSchema,
  description: "Set a query parameter with the given name and value",
  frontend: {
    icon: "fas fa-edit",
    message: ({ name, value }) => `Set a query parameter ${name} to ${value}`,
  },
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

        let params: string[] = [];
        if (queryString !== undefined) {
          params = queryString.split("&").filter((param) => {
            const [name] = param.split("=");
            return name !== args.name;
          });
        }

        params.push(`${args.name}=${args.value}`);
        const newPath = `${basePath}?${params.join("&")}`;

        return `${method} ${newPath} ${protocol}\r\n${lines
          .slice(1)
          .join("\r\n")}`;
      });

      return hasChanged
        ? "Request has been updated"
        : "Request has not changed";
    } catch (error) {
      return `Failed to set query parameter: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
