import { defineStore } from "pinia";
import { computed, ref, shallowRef, markRaw } from "vue";
import type { Chat } from "@ai-sdk/vue";
import type { UIMessage } from "ai";
import type { ToolContext } from "@/agents/types";
import { useSDK } from "@/plugins/sdk";
import { createAgent } from "@/agents/create";

type AgentEntry = {
  chat: Chat<UIMessage>;
  context: ToolContext;
};

export const useAgentsStore = defineStore("stores.agents", () => {
  const agents = shallowRef<Map<string, AgentEntry>>(new Map());
  const selectedId = ref<string | undefined>(undefined);

  const sdk = useSDK();

  async function addAgent(replaySessionId: string) {
    if (agents.value.has(replaySessionId)) {
      return agents.value.get(replaySessionId)!;
    }

    const { chat, toolContext } = await createAgent({
      replaySessionId,
      sdk,
    });

    const entry: AgentEntry = {
      chat: markRaw(chat),
      context: toolContext,
    };

    agents.value.set(replaySessionId, entry);
    return entry;
  }

  async function selectAgent(replaySessionId: string) {
    if (!agents.value.has(replaySessionId)) {
      await addAgent(replaySessionId);
    }
    selectedId.value = replaySessionId;
  }

  function getAgent(replaySessionId: string) {
    return agents.value.get(replaySessionId)?.chat;
  }

  function getToolContext(replaySessionId: string) {
    return agents.value.get(replaySessionId)?.context;
  }

  function abortSelectedAgent() {
    if (!selectedId.value) return;
    const agent = getAgent(selectedId.value);
    if (agent) {
      agent.stop();
    }
  }

  const selectedAgent = computed(() => {
    if (!selectedId.value) return undefined;
    return getAgent(selectedId.value);
  });

  const selectedToolContext = computed(() => {
    if (!selectedId.value) return undefined;
    return getToolContext(selectedId.value);
  });

  return {
    agents: computed(() =>
      Array.from(agents.value.values()).map((e) => e.chat)
    ),
    getAgent,
    getToolContext,
    selectedAgent,
    selectedToolContext,
    selectedId,
    selectAgent,
    abortSelectedAgent,
  };
});
