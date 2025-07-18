import { z } from "zod";
import type { ToolFunction, BaseToolResult } from "../types";

const RemoveQueryParameterSchema = z.object({
  rawRequest: z.string(),
  name: z.string().min(1),
});

type RemoveQueryParameterArgs = z.infer<typeof RemoveQueryParameterSchema>;

export const removeQueryParameter: ToolFunction<
  RemoveQueryParameterArgs,
  BaseToolResult
> = {
  schema: RemoveQueryParameterSchema,
  description: "Remove a query parameter with the given name",
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
      let newRequest = args.rawRequest;
      if (!queryString) {
        return {
          kind: "Success",
          data: {
            newRequestRaw: newRequest,
            findings: `Query parameter "${args.name}" removed`,
          },
        };
      }

      const params = queryString.split("&").filter((param) => {
        const [name] = param.split("=");
        return name !== args.name;
      });

      const newPath =
        params.length > 0 ? `${basePath}?${params.join("&")}` : basePath;

      newRequest = `${method} ${newPath} ${protocol}\r\n${lines
        .slice(1)
        .join("\r\n")}`;

      return {
        kind: "Success",
        data: {
          newRequestRaw: newRequest,
          findings: `Query parameter "${args.name}" removed`,
        },
      };
    } catch (error) {
      return {
        kind: "Error",
        data: {
          currentRequestRaw: args.rawRequest,
          error: `Failed to remove query parameter: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      };
    }
  },
};
