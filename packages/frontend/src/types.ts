import { CustomPrompt, ReasoningConfig } from "@/engine/types";
import { type Caido } from "@caido/sdk-frontend";

export type FrontendSDK = Caido<Record<string, never>, Record<string, never>>;

export type PluginStorage = {
  openRouterApiKey: string;
  model: string;
  reasoningConfig: ReasoningConfig;
  customPrompts: CustomPrompt[];
};
