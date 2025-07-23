import { z } from "zod";

import type { ToolFunction } from "@/engine/types";

type GrepResponseResult =
  | {
      content: string;
      found: boolean;
      totalBytes: number;
      totalMatches?: number;
      currentMatch?: number;
    }
  | {
      error: string;
    };

const GrepResponseSchema = z
  .object({
    responseID: z.string().describe("The response ID to read from"),
    offset: z
      .number()
      .optional()
      .describe(
        "Byte offset to start reading from (only used when no content/regex is specified, default: 0)"
      ),
    length: z
      .number()
      .optional()
      .describe(
        "When content/regex is specified: number of bytes to return after the match. When no content/regex: number of bytes to read from offset (default: 5000)"
      ),
    content: z
      .string()
      .optional()
      .describe(
        "String content to search for in the entire response. When specified, offset is ignored. Cannot be used with regex parameter"
      ),
    regex: z
      .string()
      .optional()
      .describe(
        "Regular expression pattern to search for in the entire response. When specified, offset is ignored. Cannot be used with content parameter"
      ),
    occurrence: z
      .number()
      .optional()
      .describe(
        "Which occurrence of the content/regex to return (1-based index, default: 1). Only used with content or regex parameter"
      ),
  })
  .refine(
    (data) => {
      const hasContent = data.content !== undefined;
      const hasRegex = data.regex !== undefined;
      return !(hasContent && hasRegex);
    },
    {
      message: "Cannot specify both content and regex parameters",
    }
  );
type GrepResponseArgs = z.infer<typeof GrepResponseSchema>;

export const grepResponse: ToolFunction<GrepResponseArgs, GrepResponseResult> =
  {
    name: "grepResponse",
    schema: GrepResponseSchema,
    description:
      "Read response content in three modes: 1) Read specific bytes from offset to offset+length, 2) Search entire response for string content and return content starting from match, or 3) Search entire response for regex pattern and return content starting from match. When content or regex is provided, it searches the entire response and returns content from the specified occurrence.",
    examples: [
      'grepResponse({responseID: "1", offset: 5000, length: 500}) // Read 500 bytes starting from byte 5000',
      'grepResponse({responseID: "1", content: "<title>", length: 100}) // Find first "<title>" and return 100 bytes starting from that content',
      'grepResponse({responseID: "1", regex: "<h[1-6]>", length: 200}) // Find first heading tag and return 200 bytes from that location',
      'grepResponse({responseID: "1", content: "error", occurrence: 2}) // Find second "error" occurrence and return default 5000 bytes from that location',
      'grepResponse({responseID: "1", regex: "\\d{3}-\\d{3}-\\d{4}", occurrence: 1}) // Find first phone number pattern',
      'grepResponse({responseID: "1", length: 2000}) // Read first 2000 bytes of response',
    ],
    frontend: {
      icon: "fas fa-search",
      message: (args) => {
        if (args.content !== undefined) {
          return `Grepped response for content "${args.content}"${
            args.occurrence !== undefined
              ? ` (occurrence ${args.occurrence})`
              : ""
          }`;
        } else if (args.regex !== undefined) {
          return `Grepped response for regex "${args.regex}"${
            args.occurrence !== undefined
              ? ` (occurrence ${args.occurrence})`
              : ""
          }`;
        } else {
          return `Reading response from offset ${
            args.offset !== undefined ? args.offset : 0
          }`;
        }
      },
      details: (_, result) => {
        if ("error" in result) {
          return result.error;
        }

        let details = result.content.slice(0, 500);
        if ("totalMatches" in result && result.totalMatches !== undefined) {
          details += `\n\nMatches: ${
            result.currentMatch !== undefined ? result.currentMatch : 0
          }/${result.totalMatches}`;
        }
        return details;
      },
    },
    handler: async (args, context) => {
      try {
        const result = await context.sdk.graphql.response({
          id: args.responseID,
        });

        if (result.response === undefined || result.response === null) {
          throw new Error("Failed to retrieve response");
        }

        const fullResponse = result.response.raw;
        const length = args.length !== undefined ? args.length : 5000;

        if (args.content !== undefined || args.regex !== undefined) {
          const occurrenceIndex =
            (args.occurrence !== undefined ? args.occurrence : 1) - 1;

          const allMatches: number[] = [];

          if (args.content !== undefined) {
            let searchIndex = 0;
            while (searchIndex < fullResponse.length) {
              const foundIndex = fullResponse.indexOf(
                args.content,
                searchIndex
              );
              if (foundIndex === -1) break;
              allMatches.push(foundIndex);
              searchIndex = foundIndex + 1;
            }
          } else if (args.regex !== undefined) {
            try {
              const regexPattern = new RegExp(args.regex, "g");
              let match;
              while ((match = regexPattern.exec(fullResponse)) !== null) {
                allMatches.push(match.index);
                if (regexPattern.lastIndex === match.index) {
                  regexPattern.lastIndex++;
                }
              }
            } catch (regexError) {
              return {
                error:
                  "Invalid regex pattern: " + (regexError as Error).message,
              };
            }
          }

          if (allMatches.length === 0) {
            return {
              content: "",
              found: false,
              totalBytes: fullResponse.length,
              totalMatches: 0,
              currentMatch: 0,
            };
          }

          if (occurrenceIndex >= allMatches.length) {
            return {
              content: "",
              found: false,
              totalBytes: fullResponse.length,
              totalMatches: allMatches.length,
              currentMatch: 0,
            };
          }

          const matchIndex = allMatches[occurrenceIndex];
          if (matchIndex === undefined) {
            return {
              content: "",
              found: false,
              totalBytes: fullResponse.length,
              totalMatches: allMatches.length,
              currentMatch: 0,
            };
          }

          const endOffset = Math.min(matchIndex + length, fullResponse.length);
          const content = fullResponse.slice(matchIndex, endOffset);

          return {
            content,
            found: true,
            totalBytes: fullResponse.length,
            totalMatches: allMatches.length,
            currentMatch: occurrenceIndex + 1,
          };
        } else {
          const offset = args.offset !== undefined ? args.offset : 0;

          if (offset >= fullResponse.length) {
            return {
              content: "",
              found: false,
              totalBytes: fullResponse.length,
            };
          }

          const endOffset = Math.min(offset + length, fullResponse.length);
          const content = fullResponse.slice(offset, endOffset);

          return {
            content,
            found: true,
            totalBytes: fullResponse.length,
          };
        }
      } catch (error) {
        return {
          error: "Error while reading response: " + (error as Error).message,
        };
      }
    },
  };
