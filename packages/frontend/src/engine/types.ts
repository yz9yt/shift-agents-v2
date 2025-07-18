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

export type BaseToolResult =
  | {
      kind: "Success";
      data: {
        newRequestRaw: string;
        findings: string;
        pause?: boolean;
      };
    }
  | {
      kind: "Error";
      data: {
        error: string;
      };
    };

// Base type that all tool arguments must extend
export type BaseToolArgs = z.infer<typeof BaseToolArgsSchema>;

// Base return type that all tools must return
export type BaseToolResult = {
  success: boolean;
  currentRequestRaw: string;
  error?: string;
  findings?: Finding[];
  pause?: boolean;
};

export type Finding = {
  title: string;
  markdown: string;
};

// Updated ToolFunction type that requires args to extend BaseToolArgs and return BaseToolResult
export type ToolFunction<TInput extends BaseToolArgs = BaseToolArgs, TOutput extends BaseToolResult = BaseToolResult> = {
  schema: z.ZodSchema<TInput>;
  handler: (args: TInput, context: ToolContext) => Promise<TOutput>;
  description: string;
};

export type AgentConfig = {
  id: string;
  name: string;
  systemPrompt: string;
  jitConfig: JITAgentConfig;
};

export type JITAgentConfig = {
  replaySessionId: number;
  jitInstructions: string;
  maxIterations: number;
};

export type AgentStatus =
  | "paused"
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
