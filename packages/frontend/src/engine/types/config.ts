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

export type ReasoningConfig = {
  enabled: boolean;
  max_tokens?: number;
};

export type OpenRouterConfig = {
  apiKey: string;
  model: string;
  reasoningEnabled: boolean;
  reasoning?: ReasoningConfig;
};

export type ModelItem = {
  name: string;
  id: string;
  isRecommended?: boolean;
  reasoningModel?: boolean;
};

export type ModelGroup = {
  label: string;
  items: ModelItem[];
};

export type CustomPrompt = {
  id: string;
  title: string;
  content: string;
  isDefault?: boolean;
};
