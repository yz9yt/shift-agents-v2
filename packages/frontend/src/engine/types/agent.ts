import { z } from "zod";

export type AgentStatus =
  | "idle"
  | "queryingAI"
  | "callingTools"
  | "sendingReplayRequest"
  | "error";

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
      kind: "toolCall";
      toolCalls: APIToolCall[];
    };

export type UIMessage =
  | {
      kind: "user";
      content: string;
    }
  | {
      kind: "assistant";
      content: string;
    }
  | {
      kind: "error";
      content: string;
    }
  | {
      kind: "tool";
      status: "processing";
      metadata: FrontendMetadata;
    }
  | {
      kind: "tool";
      status: "success";
      metadata: FrontendMetadata;
      content: string;
    }
  | {
      kind: "tool";
      status: "error";
      metadata: FrontendMetadata;
      content: string;
    };
