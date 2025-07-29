import { type Caido } from "@caido/sdk-frontend";

import { type CustomPrompt, type ReasoningConfig } from "@/engine/types";

export type FrontendSDK = Caido<Record<string, never>, Record<string, never>>;

export type PluginStorage = {
  openRouterApiKey: string;
  model: string;
  reasoningConfig: ReasoningConfig;
  customPrompts: CustomPrompt[];
};
