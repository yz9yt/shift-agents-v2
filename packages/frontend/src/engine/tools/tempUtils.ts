import { FrontendSDK } from "@/types";

export async function getCurrentReplayRequestRaw(sdk: FrontendSDK, replaySessionId: number) {
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
  return data.data.replaySession.activeEntry.request.raw;
}