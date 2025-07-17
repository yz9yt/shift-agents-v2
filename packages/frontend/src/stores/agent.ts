import { ref, computed } from "vue";
import { Agent } from "../engine/agent";
import { useSDK } from "@/plugins/sdk";
import { SECRET_API_KEY } from "@/secrets";

export const useAgentState = () => {
  const agents = ref<Map<string, Agent>>(new Map());
  const apiKey = ref<string>("");
  const sdk = useSDK();

  const createAgentFromSessionId = (sessionId: string) => {
    const agent = new Agent(
      sdk,
      {
        id: sessionId,
        name: "Agent 1",
        systemPrompt: "You are a helpful assistant.",
        jitConfig: {
          replaySessionId: parseInt(sessionId),
          jitInstructions: "You are a helpful assistant.",
        },
      },
      {
        apiKey: SECRET_API_KEY,
        model: "moonshotai/kimi-k2",
        provider: "groq",
      }
    );
    agents.value.set(sessionId, agent);
    return agent;
  };

  const removeAgent = (id: string) => {
    agents.value.delete(id);
  };

  const setApiKey = (key: string) => {
    apiKey.value = key;
  };

  const agentList = computed(() => Array.from(agents.value.values()));
  const getAgent = (id: string) => agents.value.get(id);

  return {
    agents: agentList,
    apiKey: computed(() => apiKey.value),
    getAgent,
    removeAgent,
    setApiKey,
    createAgentFromSessionId,
  };
};
