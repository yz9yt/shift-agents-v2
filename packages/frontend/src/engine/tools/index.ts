import { alert } from "./alert";
import { matchAndReplace } from "./matchAndReplace";
import { regexMatchAndReplace } from "./regexMatchAndReplace";
import { setBody } from "./setBody";
import { setPath } from "./setPath";
import { setMethod } from "./setMethod";
import { setHeader } from "./setHeader";
import { setQueryParameter } from "./setQueryParameter";
import { removeQueryParameter } from "./removeQueryParameter";
import { removeHeader } from "./removeHeader";

export const TOOLS = {
  alert,
  matchAndReplace,
  regexMatchAndReplace,
  setBody,
  setPath,
  setMethod,
  setHeader,
  setQueryParameter,
  removeQueryParameter,
  removeHeader,
} as const;

export type ToolName = keyof typeof TOOLS;

export const toolDefinitions = Object.entries(TOOLS).map(([name, tool]) => ({
  type: "function" as const,
  function: {
    name,
    description: tool.description,
    parameters: tool.schema,
  },
}));
