import { type Caido } from "@caido/sdk-frontend";

export type FrontendSDK = Caido<Record<string, never>, Record<string, never>>;

export type Storage = {
  globalAgents: Agent[];
};

export type Agent = {
  id: string;
  name: string;
  systemPrompt: string;
  knowledgeBase: string[];
  tools: Tool[];
  createdAt: Date;
  updatedAt: Date;
};

export type Tool = {
  name: string;
  parameters: Record<string, unknown>; // map of parameters
  function: (parameters: Record<string, unknown>) => Promise<boolean>; // boolean if the tool was successful
};
