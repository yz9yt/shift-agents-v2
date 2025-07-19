import * as z from "zod";

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

export const TOOLS = {
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
} as const;

export type ToolName = keyof typeof TOOLS;

export const toolDefinitions = Object.entries(TOOLS).map(([name, tool]) => ({
  type: "function" as const,
  function: {
    name,
    description: tool.description + "\n\n" + tool.instructions,
    parameters: z.toJSONSchema(tool.schema),
  },
}));
