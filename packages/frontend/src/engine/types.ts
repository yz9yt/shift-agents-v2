import { z } from "zod";

export const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
});

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().nullable(),
  tool_calls: z.array(ToolCallSchema).optional(),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
});

export const LLMResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: MessageSchema,
    })
  ),
});

export type Message = z.infer<typeof MessageSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;

// Base schema that all tool argument schemas should extend
export const BaseToolArgsSchema = z.object({
  rawRequest: z.string(),
});

// Base type that all tool arguments must extend
export type BaseToolArgs = z.infer<typeof BaseToolArgsSchema>;

// Base return type that all tools must return
export type BaseToolResult = {
  success: boolean;
  currentRequestRaw: string;
  error?: string;
  findings?: string;
};

// Updated ToolFunction type that requires args to extend BaseToolArgs and return BaseToolResult
export type ToolFunction<TInput extends BaseToolArgs = BaseToolArgs, TOutput extends BaseToolResult = BaseToolResult> = {
  schema: z.ZodSchema<TInput>;
  handler: (args: TInput) => Promise<TOutput>;
  description: string;
};

export type AgentConfig = {
  id: string;
  name: string;
  systemPrompt: string;
  jitConfig?: JITAgentConfig;
};

export type JITAgentConfig = {
  replaySessionId: number;
  jitInstructions: string;
  maxIterations?: number;
};

export type AgentStatus = "idle" | "thinking" | "calling-tool" | "error";

export type OpenRouterConfig = {
  apiKey: string;
  model: string;
  provider?: string;
};

export type APIResponse<T> =
  | { kind: "Success"; data: T }
  | { kind: "Error"; error: string };
