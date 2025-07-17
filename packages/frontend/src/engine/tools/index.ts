import { alert } from "./alert";

export const TOOLS = {
  alert,
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
