import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const SetQueryParameterSchema = z.object({
  rawRequest: z.string(),
  name: z.string().min(1),
  value: z.string(),
});

type SetQueryParameterArgs = z.infer<typeof SetQueryParameterSchema>;

export const setQueryParameter: ToolFunction<
  SetQueryParameterArgs,
  BaseToolResult
> = {
  schema: SetQueryParameterSchema,
  description: "Set a query parameter with the given name and value",
  handler: async (args) => {
    try {
      const lines = args.rawRequest.split("\r\n");
      if (lines.length === 0 || !lines[0]) {
        throw new Error("Invalid HTTP request - empty request");
      }
      const [method, path, protocol] = lines[0].split(" ");
      if (!path) {
        throw new Error("Invalid HTTP request - no path found");
      }
      const [basePath, queryString] = path.split("?");

      let params: string[] = [];
      if (queryString) {
        params = queryString.split("&").filter((param) => {
          const [name] = param.split("=");
          return name !== args.name;
        });
      }

      params.push(`${args.name}=${args.value}`);
      const newPath = `${basePath}?${params.join("&")}`;
      const newRequest = `${method} ${newPath} ${protocol}\r\n${lines
        .slice(1)
        .join("\r\n")}`;

      return {
        kind: "Success",
        data: {
          newRequestRaw: newRequest,
          findings: [
            {
              title: `Query parameter "${args.name}" set to: "${args.value}"`,
              markdown: `Query parameter "${args.name}" set to: "${args.value}"`,
            },
          ],
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          currentRequestRaw: args.rawRequest,
          error: `Failed to set query parameter: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
