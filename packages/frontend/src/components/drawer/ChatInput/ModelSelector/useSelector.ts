// modified by Albert.C Date 2025-08-22 Version 0.02
import { type Component, computed } from "vue";

import {
  AnthropicIcon,
  DeepseekIcon,
  GoogleIcon,
  OpenAIIcon,
  QwenIcon,
} from "./icons";

import { useConfigStore } from "@/stores/config";

export const useSelector = () => {
  const configStore = useConfigStore();
  
  // Model is now a computed property based on the orchestration mode
  const model = computed({
    get() {
      // In Manual mode, the first model of the sequence is selected
      if (configStore.orchestrationMode === 'Manual') {
        return configStore.manualModelSequence.length > 0
          ? configStore.manualModelSequence[0]
          : configStore.models.flatMap(g => g.items).find(i => i.isRecommended)?.id ?? '';
      }
      // For Automatic and Economy modes, placeholders for now
      return configStore.models.flatMap(g => g.items).find(i => i.isRecommended)?.id ?? '';
    },
    set(value: string) {
      if (configStore.orchestrationMode === 'Manual') {
        const existingIndex = configStore.manualModelSequence.indexOf(value);
        if (existingIndex !== 0) {
          const newSequence = [...configStore.manualModelSequence];
          if (existingIndex !== -1) {
            newSequence.splice(existingIndex, 1);
          }
          newSequence.unshift(value);
          configStore.manualModelSequence = newSequence;
        }
      }
    }
  });

  const groups = computed(() => configStore.models);

  const idToItem = computed(() => {
    const map: Record<string, { id: string; name: string }> = {};
    groups.value.forEach((g) => {
      g.items.forEach((i) => {
        map[i.id] = { id: i.id, name: i.name };
      });
    });
    return map;
  });

  const idToGroup = computed(() => {
    const map: Record<string, string> = {};
    groups.value.forEach((g) => {
      g.items.forEach((i) => {
        map[i.id] = g.label;
      });
    });
    return map;
  });

  const iconByGroup: Record<string, Component> = {
    Anthropic: AnthropicIcon,
    OpenAI: OpenAIIcon,
    Google: GoogleIcon,
    DeepSeek: DeepseekIcon,
    Qwen: QwenIcon,
  };

  const iconByModelId = computed(() => {
    const map: Record<string, Component | undefined> = {};
    Object.keys(idToGroup.value).forEach((id) => {
      const group = idToGroup.value[id];
      map[id] = group !== undefined ? iconByGroup[group] : undefined;
    });
    return map;
  });

  const selected = computed(() => idToItem.value[model.value]);

  return { model, groups, iconByModelId, selected };
};
