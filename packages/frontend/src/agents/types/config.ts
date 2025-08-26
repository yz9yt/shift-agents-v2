// modified by Albert.C Date 2025-08-22 Version 0.02
export type AgentConfig = {
  id: string;
  maxIterations: number;
  openRouterConfig: OpenRouterConfig;
  prompts: CustomPrompt[];
};

export type ReasoningConfig = {
  enabled: boolean;
  max_tokens?: number;
};

export type OpenRouterConfig = {
  apiKey: string;
  model: string;
  reasoning?: ReasoningConfig;
};

export type ModelItem = {
  name: string;
  id: string;
  isRecommended?: boolean;
  isReasoningModel?: boolean;
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

// Plugin's storage structure
export type PluginStorage = {
  openRouterApiKey: string;
  orchestrationMode: OrchestrationMode;
  manualModelSequence: string[];
  reasoningConfig: ReasoningConfig;
  maxIterations: number;
  customPrompts: CustomPrompt[];
};

// Configuration for the request controller
export type ControllerConfig = {
  maxFailures: number;
  throttleDelay: number;
};

// Configuration for the autonomous mode
export type AutoModeConfig = {
  enabled: boolean;
};

// New orchestration modes
export type OrchestrationMode = "Automatic" | "Economy" | "Manual";

// New types to manage models per phase
export type OrchestrationModels = {
  modelPhase1: string;
  modelPhase2: string;
  modelPhase3: string;
  modelPhase4: string;
  modelPhase5: string;
};
