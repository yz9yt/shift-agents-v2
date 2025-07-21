import type OpenAI from "openai";

export type AgentStatus =
  | "idle"
  | "queryingAI"
  | "callingTools"
  | "sendingReplayRequest"
  | "error";

export type APIMessage = OpenAI.ChatCompletionMessageParam;
export type APIToolCall = OpenAI.ChatCompletionMessageToolCall;

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
      id: string;
      name: string;
      arguments: string;
      isComplete: boolean;
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
