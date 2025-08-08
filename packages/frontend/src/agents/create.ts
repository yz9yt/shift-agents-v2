import { Chat } from "@ai-sdk/vue";
import { ClientSideChatTransport } from "@/agents/transport";
import { FrontendSDK } from "@/types";
import { ReplaySession, ToolContext } from "@/agents/types";
import { TodoManager } from "@/agents/todos";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SECRET_API_KEY } from "@/secrets";
import { getReplaySession } from "@/utils";
import { BASE_SYSTEM_PROMPT } from "@/agents/prompt";

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

  const openrouter = createOpenRouter({
    apiKey: SECRET_API_KEY,
  });
  const model = openrouter.chat("openai/gpt-4.1");
  const transport = new ClientSideChatTransport(
    model,
    toolContext,
    BASE_SYSTEM_PROMPT
  );

  const chat = new Chat({
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
