import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const RunJavaScriptSchema = z.object({
  code: z.string().min(1).describe("The JavaScript code to execute. This is being run in user's browser, so make sure to use only safe functions."),
});

type RunJavaScriptArgs = z.infer<typeof RunJavaScriptSchema>;

export const runJavaScript: ToolFunction<RunJavaScriptArgs, string> = {
  name: "runJavaScript",
  schema: RunJavaScriptSchema,
  description: "Execute JavaScript code for data processing, encoding/decoding, calculations, or string manipulation. Use this when you need to transform data, decode Base64, parse JSON, generate timestamps, or perform complex logic that other tools cannot handle.",
  examples: [
    "btoa('admin:password') // Encode credentials for Basic Auth",
    "JSON.parse(response).users.length // Count users in JSON response",
    "new Date().toISOString() // Generate timestamp for request",
  ],
  frontend: {
    icon: "fas fa-code",
    message: (args) => `Executed JavaScript: ${args.code.slice(0, 50)}${args.code.length > 50 ? '...' : ''}`,
    details: (args, result) => `Code: ${args.code}\nResult: ${result}`,
  },
  handler: (args) => {
    try {
      const result = eval(args.code);
      return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`JavaScript evaluation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};
