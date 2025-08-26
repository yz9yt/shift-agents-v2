// modified by Albert.C Date 2025-08-22 Version 0.03
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  type ChatRequestOptions,
  type ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
  type UIMessage,
  type UIMessageChunk,
} from "ai";

import { BASE_SYSTEM_PROMPT } from "@/agents/prompt";
import { type TodoManager } from "@/agents/todos";
import {
  addFindingTool,
  addTodoTool,
  grepResponseTool,
  removeRequestHeaderTool,
  removeRequestQueryTool,
  replaceRequestTextTool,
  runJavaScriptTool,
  sendRequestTool,
  setRequestBodyTool,
  setRequestHeaderTool,
  setRequestMethodTool,
  setRequestPathTool,
  setRequestQueryTool,
  setRequestRawTool,
  updateTodoTool,
  revertRequestTool,
  getHttpHistoryTool,
} from "@/agents/tools";
import {
  type CustomUIMessage,
  type ReplaySession,
  type ToolContext,
} from "@/agents/types";
import { markdownJoinerTransform } from "@/agents/utils/markdownJoiner";
import { useAgentsStore } from "@/stores/agents";
import { useConfigStore } from "@/stores/config";
import { useUIStore } from "@/stores/ui";
import { useErrorLogStore } from "@/stores/errorLog";
import { getReplaySession } from "@/utils";

export class ClientSideChatTransport implements ChatTransport<UIMessage> {
  constructor(private toolContext: ToolContext) {}

  async sendMessages(
    options: {
      chatId: string;
      messages: UIMessage[];
      abortSignal?: AbortSignal;
    } & {
      trigger: "submit-message" | "submit-tool-result" | "regenerate-message";
      messageId?: string;
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const { abortSignal, messages } = options;

    const initialSession = await getReplaySession(
      this.toolContext.sdk,
      this.toolContext.replaySession.id,
    );
    if (initialSession.kind === "Error") {
      throw new Error(initialSession.error);
    }

    const currentRequest = this.toolContext.replaySession.request;
    currentRequest.raw = initialSession.session.request.raw;
    currentRequest.host = initialSession.session.request.host;
    currentRequest.port = initialSession.session.request.port;
    currentRequest.isTLS = initialSession.session.request.isTLS;
    currentRequest.SNI = initialSession.session.request.SNI;

    const prompt = convertToModelMessages(messages);
    const configStore = useConfigStore();
    const agentsStore = useAgentsStore();
    const errorLogStore = useErrorLogStore();

    // Model Orchestrator logic
    let currentModelIndex = 0;
    let modelSequence: string[];
    
    switch (configStore.orchestrationMode) {
      case 'Automatic':
        modelSequence = configStore.models.flatMap(group => group.items).filter(item => item.isRecommended).map(item => item.id);
        break;
      case 'Economy':
        modelSequence = configStore.models.flatMap(group => group.items).filter(item => item.id.includes("lite") || item.id.includes("mini") || item.id.includes("free")).map(item => item.id);
        break;
      case 'Manual':
      default:
        modelSequence = configStore.manualModelSequence.length > 0
          ? configStore.manualModelSequence
          : ["anthropic/claude-sonnet-4"];
        break;
    }

    // Request Controller (Circuit Breaker)
    const failureCount = agentsStore.getAgentErrorCount(options.chatId);
    if (failureCount >= configStore.controllerConfig.maxFailures) {
      throw new Error(
        "Agent stopped: Too many consecutive API failures. Please check your API key or connection."
      );
    }

    const modelProvider = createOpenRouter({
      apiKey: configStore.openRouterApiKey,
      extraBody: {
        parallel_tool_calls: false,
        reasoning: {
          max_tokens: configStore.reasoningConfig.max_tokens,
          enabled: configStore.reasoningConfig.enabled,
        },
      },
    });

    const stream = createUIMessageStream<CustomUIMessage>({
      execute: async ({ writer }) => {
        // Request Controller (Throttling)
        await new Promise(resolve => setTimeout(resolve, configStore.controllerConfig.throttleDelay));

        const result = streamText({
          model: modelProvider(modelSequence[currentModelIndex]),
          system: buildSystemPrompt(this.toolContext.replaySession.id),
          messages: prompt,
          abortSignal: abortSignal,
          stopWhen: stepCountIs(configStore.maxIterations),
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
            revertRequest: revertRequestTool,
            getHttpHistory: getHttpHistoryTool,
          },
          onFinish: () => {
            this.toolContext.todoManager.clearTodos();
            agentsStore.resetAgentErrorCount(options.chatId);
          },
          prepareStep: (step) => {
            // Cycle through the model sequence for each step
            currentModelIndex = (currentModelIndex + 1) % modelSequence.length;
            
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
          experimental_transform: [markdownJoinerTransform()],
          experimental_context: this.toolContext,
          onError: ({ error }) => {
            const errorText =
              error instanceof Error ? error.message : String(error);

            if (errorText.includes("abort")) {
              return;
            }

            writer.write({
              type: "error",
              errorText,
            });

            this.toolContext.sdk.window.showToast(
              "[Shift Agents] Error: " + errorText,
              {
                variant: "error",
              },
            );

            console.error(error);
            agentsStore.incrementAgentErrorCount(options.chatId);
            errorLogStore.addError(options.chatId, errorText);
          },
        });

        writer.merge(
          result.toUIMessageStream({
            messageMetadata: ({ part }) => {
              if (part.type === "start") {
                return {
                  state: "streaming",
                };
              }

              if (part.type === "finish") {
                return {
                  state: "done",
                };
              }

              if (part.type === "error") {
                return {
                  state: "error",
                };
              }

              if (part.type === "abort") {
                return {
                  state: "abort",
                };
              }

              return {};
            },
            sendReasoning: true,
          }),
        );
      },
    });

    return stream;
  }

  reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return Promise.resolve(null);
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

  contextContent += `<|current_request|>
The HTTP request you are analyzing:
<|raw|>${currentRequest.request.raw}</|raw|>
<|host|>${currentRequest.request.host}</|host|>
<|port|>${currentRequest.request.port}</|port|>
</|current_request|>
\n\n`;

  const allTodos = todoManager.getTodos();
  if (allTodos.length > 0) {
    const pendingTodos = allTodos.filter((todo) => todo.status === "pending");
    const completedTodos = allTodos.filter(
      (todo) => todo.status === "completed",
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

function buildSystemPrompt(agentId: string) {
  const configStore = useConfigStore();
  const uiStore = useUIStore();

  const selectedPromptsIds = uiStore.getSelectedPrompts(agentId);

  const selectedPrompts = configStore.customPrompts.filter((prompt) =>
    selectedPromptsIds.includes(prompt.id),
  );

  let prompt = `<system_prompt>${BASE_SYSTEM_PROMPT}</system_prompt>`;

  if (selectedPrompts.length > 0) {
    prompt += `\n<additional_instructions>\n`;
    prompt += selectedPrompts
      .map((prompt) => `<prompt>${prompt.content}</prompt>`)
      .join("\n");
    prompt += `\n</additional_instructions>`;
  }

  return prompt;
}
