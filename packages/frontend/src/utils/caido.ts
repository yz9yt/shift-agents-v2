import { type FrontendSDK } from "@/types";

export const getCurrentlySelectedReplayTabSessionId = () => {
  const activeTab = document.querySelector(
    '[data-is-selected="true"][data-session-id]',
  );
  return activeTab ? activeTab.getAttribute("data-session-id") : "";
};

export type ReplayRequest =
  | {
      kind: "Ok";
      raw: string;
      host: string;
      port: number;
      isTLS: boolean;
      SNI: string;
    }
  | {
      kind: "Error";
      error: string;
    };

export async function getCurrentReplayRequest(
  sdk: FrontendSDK,
  replaySessionId: string,
): Promise<ReplayRequest> {
  if (typeof replaySessionId !== "string") {
    return {
      kind: "Error",
      error: "replaySessionId must be a string",
    };
  }

  const result = await sdk.graphql.replayEntry({
    id: replaySessionId,
  });
  const activeEntry = result.replayEntry;

  if (activeEntry === undefined || activeEntry === null) {
    return {
      kind: "Error",
      error: "No request found",
    };
  }

  return {
    kind: "Ok",
    raw: activeEntry.raw,
    host: activeEntry.connection.host,
    port: activeEntry.connection.port,
    isTLS: activeEntry.connection.isTLS,
    SNI: activeEntry.connection.SNI,
  } as ReplayRequest;
}
