import { z } from "zod";

export type AgentStatus =
  | "idle"
  | "queryingAI"
  | "callingTools"
  | "sendingReplayRequest";

export const APIToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
});

export const DeltaToolCallSchema = z.object({
  index: z.number(),
  id: z.string().optional(),
  function: z
    .object({
      name: z.string().optional(),
      arguments: z.string().optional(),
    })
    .optional(),
});

export const APIMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().nullable(),
  tool_calls: z.array(APIToolCallSchema).optional(),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
  reasoning: z.string().optional(),
  reasoning_details: z.array(z.unknown()).optional(),
});

export type APIMessage = z.infer<typeof APIMessageSchema>;
export type APIToolCall = z.infer<typeof APIToolCallSchema>;
export type DeltaToolCall = z.infer<typeof DeltaToolCallSchema>;

export type FrontendMetadata = {
  icon: string;
  message: string;
  details?: string;
};

export type StreamChunk =
  | {
      kind: "text";
      content: string;
    }
  | {
      kind: "reasoning";
      content: string;
    }
  | {
      kind: "toolCall";
      toolCalls: APIToolCall[];
    }
  | {
      kind: "partialToolCall";
      toolCalls: APIToolCall[];
    };

export type UIMessage =
  | {
      id: string;
      kind: "user";
      content: string;
    }
  | {
      id: string;
      kind: "assistant";
      content: string;
      reasoning?: string;
    }
  | {
      id: string;
      kind: "error";
      content: string;
    }
  | {
      id: string;
      kind: "tool";
      status: "processing";
      metadata: FrontendMetadata;
    }
  | {
      id: string;
      kind: "tool";
      status: "success";
      metadata: FrontendMetadata;
      content: string;
    }
  | {
      id: string;
      kind: "tool";
      status: "error";
      metadata: FrontendMetadata;
      content: string;
    };
