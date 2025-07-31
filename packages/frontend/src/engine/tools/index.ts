import { z } from "zod";

import { addFinding } from "./addFinding";
import { addTodo } from "./addTodo";
import { grepResponse } from "./grepResponse";
import { removeRequestHeader } from "./removeRequestHeader";
import { removeRequestQuery } from "./removeRequestQuery";
import { replaceRequestText } from "./replaceRequestText";
import { runJavaScript } from "./runJavaScript";
import { sendRequest } from "./sendRequest";
import { setRequestBody } from "./setRequestBody";
import { setRequestHeader } from "./setRequestHeader";
import { setRequestMethod } from "./setRequestMethod";
import { setRequestPath } from "./setRequestPath";
import { setRequestQuery } from "./setRequestQuery";
import { setRequestRaw } from "./setRequestRaw";
import { updateTodo } from "./updateTodo";

import {
  type FrontendMetadata,
  type ToolContext,
  type ToolResult,
} from "@/engine/types";

export const TOOLS = [
  setRequestHeader,
  setRequestQuery,
  setRequestBody,
  setRequestMethod,
  setRequestPath,
  removeRequestHeader,
  removeRequestQuery,
  sendRequest,
  grepResponse,
  addFinding,
  addTodo,
  updateTodo,
  runJavaScript,
  replaceRequestText,
  setRequestRaw,
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
