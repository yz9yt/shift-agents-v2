import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

type SendRequestResult =
  | {
      rawResponse: string;
      roundtripTime: number;
    }
  | {
      error: string;
    };

const SendRequestSchema = z.object({}).optional();
type SendRequestArgs = z.infer<typeof SendRequestSchema>;

export const sendRequest: ToolFunction<SendRequestArgs, SendRequestResult> = {
  name: "sendRequest",
  schema: SendRequestSchema,
  description:
    "Send the current request and return the response. Usage: sendRequest() or sendRequest({})",
  frontend: {
    icon: "fas fa-terminal",
    message: () => `Sent the request`,
    details: (_, result) => {
      if ("error" in result) {
        return result.error;
      }

      return result.rawResponse.slice(0, 1000);
    },
  },
  handler: async (args, context) => {
    // @ts-expect-error - no types yet for sendRequest
    context.sdk.replay.sendRequest(context.replaySession.id, {
      connectionInfo: {
        host: context.replaySession.request.host,
        isTLS: context.replaySession.request.isTLS,
        port: context.replaySession.request.port,
      },
      raw: context.replaySession.request.raw,
    });

    try {
      let responseID: string | undefined = undefined;
      const iterator = context.sdk.graphql.updatedReplaySession({});

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Request timeout after 30 seconds")),
          30000
        );
      });

      const responsePromise = (async () => {
        for await (const event of iterator) {
          if (
            event.updatedReplaySession.sessionEdge.node.id ===
            context.replaySession.id
          ) {
            responseID =
              event.updatedReplaySession.sessionEdge.node.activeEntry?.request
                ?.response?.id;
            break;
          }
        }
      })();

      await Promise.race([responsePromise, timeout]);

      if (responseID === undefined) {
        throw new Error("No response received");
      }

      const result = await context.sdk.graphql.response({
        id: responseID,
      });

      if (result.response === undefined || result.response === null) {
        throw new Error("Failed to retrieve response");
      }

      return {
        rawResponse: result.response.raw,
        roundtripTime: result.response.roundtripTime,
      };
    } catch (error) {
      return {
        error: "Error while sending request: " + (error as Error).message,
      };
    }
  },
};
