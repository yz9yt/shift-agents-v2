export const getCurrentlySelectedReplayTabSessionId = () => {
  const activeTab = document.querySelector(
    '[data-is-selected="true"][data-session-id]'
  );
  return activeTab ? activeTab.getAttribute("data-session-id") : "";
};

export async function getCurrentReplayRequestRaw(replaySessionId: string) {
  const auth = JSON.parse(localStorage.getItem("CAIDO_AUTHENTICATION") || "{}");
  const accessToken = auth.accessToken;

  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query:
        "query replaySessionEntries($id: ID!){\n    replaySession(id: $id){\n        activeEntry{\n            request{\n                raw\n            }\n        }\n    }\n}",
      variables: { id: replaySessionId },
      operationName: "replaySessionEntries",
    }),
  });
  const data = await response.json();
  return atob(data.data.replaySession.activeEntry.request.raw as string);
}

export async function getCurrentReplayRequestMetadata(replaySessionId: string) {
  const auth = JSON.parse(localStorage.getItem("CAIDO_AUTHENTICATION") || "{}");
  const accessToken = auth.accessToken;

  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query:
        "query replaySessionEntries($id: ID!){\n    replaySession(id: $id){\n        activeEntry{\n            request{\n                raw\n isTls\n port\n host\n            }\n        }\n    }\n}",
      variables: { id: replaySessionId },
      operationName: "replaySessionEntries",
    }),
  });
  const data = await response.json();
  return data.data.replaySession.activeEntry.request;
}

export async function sendReplaySessionEntry(
  replaySessionId: string,
  rawRequest: string
): Promise<boolean> {
  const auth = JSON.parse(localStorage.getItem("CAIDO_AUTHENTICATION") || "{}");
  const accessToken = auth.accessToken;
  const sessionData = await getCurrentReplayRequestMetadata(replaySessionId);
  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query:
        "mutation startReplayTask($sessionId: ID!, $input: StartReplayTaskInput!) {\n  startReplayTask(sessionId: $sessionId, input: $input) {\n    task {\n   id createdAt } } }",
      variables: {
        input: {
          connection: {
            host: sessionData.host,
            isTLS: sessionData.isTls,
            port: sessionData.port,
          },
          raw: btoa(rawRequest),
          settings: {
            placeholders: [],
            updateContentLength: true,
          },
        },
        sessionId: replaySessionId,
      },
      operationName: "startReplayTask",
    }),
  });
  const data = await response.json();
  return data.data.startReplayTask.task.id !== null;
}
