import { z } from "zod";
import { HttpForge } from "ts-http-forge";

import type { ToolFunction } from "@/engine/types";

const SetRequestBodySchema = z.object({
  body: z.string().describe("The request body content (JSON, form data, raw text, etc.)"),
});

type SetRequestBodyArgs = z.infer<typeof SetRequestBodySchema>;
export const setRequestBody: ToolFunction<SetRequestBodyArgs, string> = {
  name: "setRequestBody",
  schema: SetRequestBodySchema,
  description: "Replace the entire request body content. Use this to send JSON data, form data, XML, or any other payload format for POST/PUT requests or testing purposes.",
  frontend: {
    icon: "fas fa-edit",
    message: () => `Updated the request body`,
    details: ({ body }) => body,
  },
  handler: (args, context) => {
    try {
      context.replaySession.updateRequestRaw((draft) => {
        return HttpForge.create(draft)
          .body(args.body)
          .build();
      });

      return "Request has been updated";
    } catch (error) {
      return `Failed to set body: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
};
