import { type z } from "zod";

import { type FrontendMetadata } from "@/engine/types/agent";
import { type FrontendSDK } from "@/types";
import { TodoManager } from "@/engine/todo";

export type ToolContext = {
  sdk: FrontendSDK;
  replaySession: {
    request: {
      raw: string;
      host: string;
      port: number;
      isTLS: boolean;
      SNI: string;
    };
    id: string;
    updateRequestRaw: (updater: (draft: string) => string) => boolean;
  };
  agent: {
    name: string;
  };
  todoManager: TodoManager;
};

export type ToolFunctionFrontend<TInput = unknown, TOutput = unknown> = {
  icon: string;
  message: (args: TInput) => string;
  details?: (args: TInput, output: TOutput) => string;
};

export type ToolFunction<TInput = unknown, TOutput = unknown> = {
  name: string;
  schema: z.ZodSchema<TInput>;
  handler: (args: TInput, context: ToolContext) => Promise<TOutput> | TOutput;
  description: string;
  examples?: string[];
  frontend: ToolFunctionFrontend<TInput, TOutput>;
};

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type ToolResult<TOutput = unknown> =
  | {
      kind: "success";
      id: string;
      result: TOutput;
      uiMessage: FrontendMetadata;
    }
  | {
      kind: "error";
      id: string;
      error: string;
      uiMessage: FrontendMetadata;
    };
