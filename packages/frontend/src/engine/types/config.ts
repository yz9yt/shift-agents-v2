export type AgentConfig = {
  id: string;
  name: string;
  systemPrompt: string;
  jitConfig: JITAgentConfig;
  openRouterConfig: OpenRouterConfig;
};

export type JITAgentConfig = {
  replaySessionId: string;
  jitInstructions: string;
  maxIterations: number;
};

export type OpenRouterConfig = {
  apiKey: string;
  model: string;
};
