import { FrontendSDK } from "@/types";
import { z } from "zod";

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

export const APILLMResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: APIMessageSchema,
    })
  ),
});

export type APIMessage = z.infer<typeof APIMessageSchema>;
export type APIToolCall = z.infer<typeof APIToolCallSchema>;

export type ToolContext = {
  sdk: FrontendSDK;
  replaySession: {
    requestRaw: string;
    id: string;
    updateRequestRaw: (updater: (draft: string) => string) => boolean;
  };
  agent: {
    name: string;
  };
};

export type ToolFunction<TInput = unknown, TOutput = unknown> = {
  schema: z.ZodSchema<TInput>;
  handler: (args: TInput, context: ToolContext) => Promise<TOutput> | TOutput;
  description: string;
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

export type APIResponse<T> =
  | { kind: "Success"; data: T }
  | { kind: "Error"; error: string };
