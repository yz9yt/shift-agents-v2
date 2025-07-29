import { z } from "zod";

import { addFinding } from "./addFinding";
import { addTodo } from "./addTodo";
import { evalJs } from "./eval";
import { grepResponse } from "./grepResponse";
import { matchAndReplace } from "./matchAndReplace";
import { removeHeader } from "./removeHeader";
import { removeQueryParameter } from "./removeQueryParameter";
import { sendRequest } from "./sendRequest";
import { setBody } from "./setBody";
import { setHeader } from "./setHeader";
import { setMethod } from "./setMethod";
import { setPath } from "./setPath";
import { setQueryParameter } from "./setQueryParameter";
import { setRaw } from "./setRaw";
import { updateTodo } from "./updateTodo";

import {
  type FrontendMetadata,
  type ToolContext,
  type ToolResult,
} from "@/engine/types";

export const TOOLS = [
  matchAndReplace,
  setBody,
  setPath,
  setMethod,
  setHeader,
  setQueryParameter,
  removeQueryParameter,
  removeHeader,
  setRaw,
  addFinding,
  sendRequest,
  grepResponse,
  addTodo,
  updateTodo,
  evalJs,
] as const;

export const toolDefinitions = TOOLS.map((tool) => ({
  type: "function" as const,
  function: {
    name: tool.name,
    description:
      tool.description +
      (tool.examples ? `\n\nExamples:\n${tool.examples.join("\n")}` : ""),
    parameters: z.toJSONSchema(tool.schema),
  },
}));

export async function executeTool(
  id: string,
  name: string,
  args: string,
  context: ToolContext,
): Promise<ToolResult> {
  try {
    const tool = TOOLS.find((tool) => tool.name === name);
    const parsedArgs = JSON.parse(args || "{}");

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
    // @ts-expect-error - TODO: fix
    const result = await tool.handler(validatedArgs, context);

    const uiMessage: FrontendMetadata = {
      icon: tool.frontend.icon,
      // @ts-expect-error - TODO: fix
      message: tool.frontend.message(validatedArgs),
      // @ts-expect-error - TODO: fix
      details: tool.frontend.details?.(validatedArgs, result),
    };

    return {
      kind: "success",
      id,
      result,
      uiMessage,
    };
  } catch (error) {
    console.error("Tool execution failed", error);
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
