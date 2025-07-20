import { z } from "zod";

import { type FrontendSDK } from "@/types";

export const APIToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
});

export const APIMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().nullable(),
  tool_calls: z.array(APIToolCallSchema).optional(),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
});

export type APIMessage = z.infer<typeof APIMessageSchema>;
export type APIToolCall = z.infer<typeof APIToolCallSchema>;

export type ComputedFrontendMetadata = {
  icon: string;
  message: string;
  details?: string;
};

export type FrontendToolCall =
  | {
      kind: "success";
      message: APIMessage;
      frontend: ComputedFrontendMetadata;
    }
  | {
      kind: "processing";
      frontend: ComputedFrontendMetadata;
    }
  | {
      kind: "error";
      message: APIMessage;
    };

export type FrontendMessage = {
  role: "user" | "assistant" | "system" | "tool" | "error";
  content?: string;
  tool_call?: FrontendToolCall;
};

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
};

export type ToolFunctionFrontend<TInput = unknown, TOutput = unknown> = {
  icon: string;
  message: (args: TInput) => string;
  details?: (args: TInput, output: TOutput) => string;
};

export type ToolFunction<TInput = unknown, TOutput = unknown> = {
  schema: z.ZodSchema<TInput>;
  handler: (args: TInput, context: ToolContext) => Promise<TOutput> | TOutput;
  description: string;
  frontend: ToolFunctionFrontend<TInput, TOutput>;
  instructions?: string;
};

export type AgentConfig = {
  id: string;
  name: string;
  systemPrompt: string;
  jitConfig: JITAgentConfig;
};

export type JITAgentConfig = {
  replaySessionId: string;
  jitInstructions: string;
  maxIterations: number;
};

export type AgentStatus =
  | "idle"
  | "queryingAI"
  | "callingTools"
  | "sendingReplayRequest"
  | "error";

export type OpenRouterConfig = {
  apiKey: string;
  model: string;
};
