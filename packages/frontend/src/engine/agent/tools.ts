import { z } from "zod";

import {
  type FrontendMetadata,
  type ToolContext,
  type ToolDefinition,
  type ToolFunction,
  type ToolResult,
} from "@/engine/types";

export class ToolRegistry {
  private tools = new Map<string, ToolFunction>();

  register<T extends ToolFunction>(name: string, tool: T): void {
    if (this.tools.has(name)) {
      throw new Error(`Tool "${name}" already registered`);
    }

    this.tools.set(name, tool);
  }

  get(name: string): ToolFunction | undefined {
    return this.tools.get(name);
  }

  getDefinitions(): ToolDefinition[] {
    const definitions: ToolDefinition[] = [];

    for (const [name, tool] of this.tools) {
      definitions.push({
        type: "function",
        function: {
          name,
          description: tool.description,
          parameters: z.toJSONSchema(tool.schema),
        },
      });
    }

    return definitions;
  }
  async execute(
    id: string,
    name: string,
    args: string,
    context: ToolContext,
  ): Promise<ToolResult> {
    try {
      const tool = this.tools.get(name);
      const parsedArgs = JSON.parse(args);

      if (!tool) {
        return {
          kind: "error",
          id,
          error: `Tool "${name}" not found. Available tools: ${[
            ...this.tools.keys(),
          ].join(", ")}`,
          uiMessage: {
            icon: "fas fa-exclamation-triangle",
            message: `Tool "${name}" not found`,
          },
        };
      }

      const validatedArgs = tool.schema.parse(parsedArgs);
      const result = await tool.handler(validatedArgs, context);

      const uiMessage: FrontendMetadata = {
        icon: tool.frontend.icon,
        message: tool.frontend.message(validatedArgs),
        details: tool.frontend.details?.(validatedArgs, result),
      };

      return {
        kind: "success",
        id,
        result,
        uiMessage,
      };
    } catch (error) {
      return {
        kind: "error",
        id,
        error: error instanceof Error ? error.message : String(error),
        uiMessage: {
          icon: "fas fa-exclamation-triangle",
          message: "Tool execution failed",
        },
      };
    }
  }
}
