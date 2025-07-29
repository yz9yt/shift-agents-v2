import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

const EvalSchema = z.object({
  code: z.string().min(1),
});

type EvalArgs = z.infer<typeof EvalSchema>;

export const evalJs: ToolFunction<EvalArgs, string> = {
  name: "evalJs",
  schema: EvalSchema,
  description: "Execute JavaScript code in a browser environment. Use this tool for calculations, base64 encoding/decoding, string manipulations, JSON parsing, or any other JavaScript operations. The environment includes all standard browser APIs.",
  examples: [
    "btoa('hello world') // Base64 encode",
    "atob('aGVsbG8gd29ybGQ=') // Base64 decode",
    "new Date().toISOString() // Current timestamp",
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
