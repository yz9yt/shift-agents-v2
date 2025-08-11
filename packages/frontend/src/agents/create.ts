import { Chat } from "@ai-sdk/vue";

import { BASE_SYSTEM_PROMPT } from "@/agents/prompt";
import { TodoManager } from "@/agents/todos";
import { ClientSideChatTransport } from "@/agents/transport";
import {
  type CustomUIMessage,
  type ReplaySession,
  type ToolContext,
} from "@/agents/types";
import { type FrontendSDK } from "@/types";
import { getReplaySession } from "@/utils";

export async function createAgent({
  replaySessionId,
  sdk,
}: {
  replaySessionId: string;
  sdk: FrontendSDK;
}) {
  const initialSession = await getReplaySession(sdk, replaySessionId);
  if (initialSession.kind === "Error") {
    throw new Error(initialSession.error);
  }

  const todoManager = new TodoManager();
  const toolContext = buildToolContext({
    sdk,
    initialSession: initialSession.session,
    todoManager,
  });

  const transport = new ClientSideChatTransport(
    toolContext,
    BASE_SYSTEM_PROMPT,
  );

  const chat = new Chat<CustomUIMessage>({
    id: replaySessionId,
    transport,
  });

  return {
    chat,
    toolContext,
  };
}

function buildToolContext({
  sdk,
  initialSession,
  todoManager,
}: {
  sdk: FrontendSDK;
  initialSession: ReplaySession;
  todoManager: TodoManager;
}): ToolContext {
  const requestState = { ...initialSession.request };

  return {
    sdk,
    replaySession: {
      id: initialSession.id,
      request: requestState,
      updateRequestRaw: (updater) => {
        const newRaw = updater(requestState.raw);
        requestState.raw = newRaw;

        return true;
      },
    },
    todoManager,
  };
}
