import { z } from "zod";

import { addFinding } from "./addFinding";
import { alert } from "./alert";
import { matchAndReplace } from "./matchAndReplace";
import { pause } from "./pause";
import { removeHeader } from "./removeHeader";
import { removeQueryParameter } from "./removeQueryParameter";
import { sendRequest } from "./sendRequest";
import { setBody } from "./setBody";
import { setHeader } from "./setHeader";
import { setMethod } from "./setMethod";
import { setPath } from "./setPath";
import { setQueryParameter } from "./setQueryParameter";
import { FrontendMetadata, ToolContext, ToolResult } from "@/engine/types";

export const TOOLS = [
  alert,
  matchAndReplace,
  setBody,
  setPath,
  setMethod,
  setHeader,
  setQueryParameter,
  removeQueryParameter,
  removeHeader,
  pause,
  addFinding,
  sendRequest,
] as const;

export const toolDefinitions = TOOLS.map((tool) => ({
  type: "function" as const,
  function: {
    name: tool.name,
    description: tool.description,
    parameters: z.toJSONSchema(tool.schema),
  },
}));

export async function executeTool(
  id: string,
  name: string,
  args: string,
  context: ToolContext
): Promise<ToolResult> {
  try {
    const tool = TOOLS.find((tool) => tool.name === name);
    const parsedArgs = JSON.parse(args);

    if (!tool) {
      return {
        kind: "error",
        id,
        error: `Tool "${name}" not found. Available tools: ${[
          ...TOOLS.map((tool) => tool.name),
        ].join(", ")}`,
        uiMessage: {
          icon: "fas fa-exclamation-triangle",
          message: `Tool "${name}" not found`,
        },
      };
    }

    const validatedArgs = tool.schema.parse(parsedArgs);
    // @ts-expect-error - tool.handler is not typed
    const result = await tool.handler(validatedArgs, context);

    const uiMessage: FrontendMetadata = {
      icon: tool.frontend.icon,
      // @ts-expect-error - tool.frontend.message is not typed
      message: tool.frontend.message(validatedArgs),
      // @ts-expect-error - tool.frontend.details is not typed
      details: tool.frontend.details?.(validatedArgs, result),
    };

    return {
      kind: "success",
      id,
      result,
      uiMessage,
    };
  } catch (error) {
    return {
      kind: "error",
      id,
      error: error instanceof Error ? error.message : String(error),
      uiMessage: {
        icon: "fas fa-exclamation-triangle",
        message: "Tool execution failed",
      },
    };
  }
}
