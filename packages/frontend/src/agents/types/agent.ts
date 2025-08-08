import { TodoManager } from "@/agents/todos";
import { FrontendSDK } from "@/types";

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
};
