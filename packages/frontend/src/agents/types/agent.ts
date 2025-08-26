// modified by Albert.C Date 2025-08-22 Version 0.01
import { type UIMessage } from "ai";
import { z } from "zod";

import { type TodoManager } from "@/agents/todos";
import { type FrontendSDK } from "@/types";

export type ToolContext = {
  sdk: FrontendSDK;
  replaySession: ReplaySession;
  todoManager: TodoManager;
};

export type ReplaySession = {
  id: string;
  request: {
    raw: string;
    host: string;
    port: number;
    isTLS: boolean;
    SNI: string;
  };
  updateRequestRaw: (updater: (draft: string) => string) => boolean;
  requestHistory: string[]; // Add a request history
  revertRequestRaw: () => boolean; // Add a function to revert the raw request
};

// This is metadata of the entire message, not just the part
export const messageStateSchema = z.enum([
  "streaming",
  "done",
  "error",
  "abort",
]);
export const messageMetadataSchema = z.object({
  createdAt: z.number().optional(),
  finishedAt: z.number().optional(),
  state: messageStateSchema.optional(),
});

export type MessageState = z.infer<typeof messageStateSchema>;
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type CustomUIMessage = UIMessage<MessageMetadata>;
