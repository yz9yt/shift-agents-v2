import { type Caido } from "@caido/sdk-frontend";

import { type CustomPrompt, type ReasoningConfig } from "@/agents/types/config";

export type FrontendSDK = Caido<Record<string, never>, Record<string, never>>;

export type PluginStorage = {
  openRouterApiKey: string;
  model: string;
  reasoningConfig: ReasoningConfig;
  maxIterations: number;
  customPrompts: CustomPrompt[];
};
