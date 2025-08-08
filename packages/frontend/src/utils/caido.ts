import { ReplaySession } from "@/agents/types";
import { type FrontendSDK } from "@/types";

export const getCurrentlySelectedReplayTabSessionId = () => {
  const activeTab = document.querySelector(
    '[data-is-selected="true"][data-session-id]'
  );
  return activeTab ? activeTab.getAttribute("data-session-id") : "";
};

export type ReplayRequest =
  | {
      kind: "Ok";
      session: ReplaySession;
    }
  | {
      kind: "Error";
      error: string;
    };

export async function getReplaySession(
  sdk: FrontendSDK,
  replaySessionId: string
): Promise<ReplayRequest> {
  if (typeof replaySessionId !== "string") {
    return {
      kind: "Error",
      error: "replaySessionId must be a string",
    };
  }

  const sessionResult = await sdk.graphql.replaySessionEntries({
    id: replaySessionId,
  });
  const activeEntry = sessionResult.replaySession?.activeEntry;

  if (activeEntry === undefined || activeEntry === null) {
    return {
      kind: "Error",
      error: "No active entry found",
    };
  }

  const entryResult = await sdk.graphql.replayEntry({
    id: activeEntry.id,
  });
  const replayEntry = entryResult.replayEntry;

  if (replayEntry === undefined || replayEntry === null) {
    return {
      kind: "Error",
      error: "No request found",
    };
  }

  return {
    kind: "Ok",
    session: {
      id: replaySessionId,
      request: {
        raw: replayEntry.raw,
        host: replayEntry.connection.host,
        port: replayEntry.connection.port,
        isTLS: replayEntry.connection.isTLS,
        SNI: replayEntry.connection.SNI,
      },
    },
  } as ReplayRequest;
}
