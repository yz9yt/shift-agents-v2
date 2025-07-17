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
  parameters: Record<string, any>; // map of parameters
  function: (parameters: Record<string, any>) => Promise<boolean>; // boolean if the tool was successful
};

export enum AgentState {
  Paused = "paused", // Agent has been paused. This state occurs when
  Restarted = "restarted",
  Error = "error",
  WaitingOnAI = "running - waiting on ai",
  ReadyToImplementActions = "idle - ready to implement actions",
  WaitingOnReplay = "running - waiting on replay",
  ReadyToTellAI = "idle - ready to tell ai",
}
