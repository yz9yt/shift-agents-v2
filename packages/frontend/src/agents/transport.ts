import { ReplaySession, ToolContext } from "@/agents/types";
import { LanguageModelV2 } from "@openrouter/ai-sdk-provider";
import {
  ChatTransport,
  UIMessage,
  UIMessageChunk,
  streamText,
  convertToModelMessages,
  ChatRequestOptions,
  createUIMessageStream,
  smoothStream,
  stepCountIs,
} from "ai";
import {
  sendRequestTool,
  updateTodoTool,
  setRequestRawTool,
  setRequestQueryTool,
  setRequestPathTool,
  setRequestMethodTool,
  setRequestHeaderTool,
  setRequestBodyTool,
  runJavaScriptTool,
  replaceRequestTextTool,
  removeRequestQueryTool,
  removeRequestHeaderTool,
  grepResponseTool,
  addTodoTool,
  addFindingTool,
} from "@/agents/tools";
import { markdownJoinerTransform } from "@/agents/utils/markdownJoiner";
import { TodoManager } from "@/agents/todos";

export class ClientSideChatTransport implements ChatTransport<UIMessage> {
  constructor(
    private model: LanguageModelV2,
    private toolContext: ToolContext,
    private systemPrompt: string
  ) {}

  async sendMessages(
    options: {
      chatId: string;
      messages: UIMessage[];
      abortSignal?: AbortSignal;
    } & {
      trigger: "submit-message" | "submit-tool-result" | "regenerate-message";
      messageId?: string;
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk>> {
    const prompt = convertToModelMessages(options.messages);

    const stream = createUIMessageStream<UIMessage>({
      execute: ({ writer }) => {
        const result = streamText({
          model: this.model,
          system: this.systemPrompt,
          messages: prompt,
          abortSignal: options.abortSignal,
          stopWhen: stepCountIs(25),
          tools: {
            sendRequest: sendRequestTool,
            updateTodo: updateTodoTool,
            setRequestRaw: setRequestRawTool,
            setRequestQuery: setRequestQueryTool,
            setRequestPath: setRequestPathTool,
            setRequestMethod: setRequestMethodTool,
            setRequestHeader: setRequestHeaderTool,
            setRequestBody: setRequestBodyTool,
            runJavaScript: runJavaScriptTool,
            replaceRequestText: replaceRequestTextTool,
            removeRequestQuery: removeRequestQueryTool,
            removeRequestHeader: removeRequestHeaderTool,
            grepResponse: grepResponseTool,
            addTodo: addTodoTool,
            addFinding: addFindingTool,
          },
          onFinish: () => {
            this.toolContext.todoManager.clearTodos();
          },
          prepareStep: (step) => {
            return {
              messages: [
                ...step.messages,
                {
                  role: "user",
                  content: contextMessages({
                    currentRequest: this.toolContext.replaySession,
                    todoManager: this.toolContext.todoManager,
                  }),
                },
              ],
            };
          },
          experimental_transform: [
            smoothStream({
              delayInMs: 20,
              chunking: "word",
            }),
            markdownJoinerTransform(),
          ],
          experimental_context: this.toolContext,
          onError: (error) => {
            const errorText =
              error instanceof Error ? error.message : String(error);

            writer.write({
              type: "error",
              errorText,
            });

            this.toolContext.sdk.window.showToast(
              "[Shift Agents] Error: " + errorText,
              {
                variant: "error",
              }
            );

            console.error(error);
          },
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return stream;
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}

function contextMessages({
  currentRequest,
  todoManager,
}: {
  currentRequest: ReplaySession;
  todoManager: TodoManager;
}): string {
  let contextContent =
    "This message gets automatically attached. Here is the current context about the environment and replay session:\n\n";

  contextContent += `<current_request>
The HTTP request you are analyzing:
<raw>${currentRequest.request.raw}</raw>
<host>${currentRequest.request.host}</host>
<port>${currentRequest.request.port}</port>
</current_request>\n\n`;

  const allTodos = todoManager.getTodos();
  if (allTodos.length > 0) {
    const pendingTodos = allTodos.filter((todo) => todo.status === "pending");
    const completedTodos = allTodos.filter(
      (todo) => todo.status === "completed"
    );

    contextContent += `<todos>
Current status of todos:`;

    if (completedTodos.length > 0) {
      contextContent += `

Completed todos:
${completedTodos
  .map((todo) => `- [x] ${todo.content} (ID: ${todo.id})`)
  .join("\n")}`;
    }

    if (pendingTodos.length > 0) {
      contextContent += `

Pending todos:
${pendingTodos
  .map((todo) => `- [ ] ${todo.content} (ID: ${todo.id})`)
  .join("\n")}`;
    }

    contextContent += `

You can mark pending todos as finished using the todo tool with their IDs.
</todos>\n\n`;
  }

  return contextContent.trim();
}
