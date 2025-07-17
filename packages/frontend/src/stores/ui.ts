import { ref } from "vue";

export const useUIState = () => {
  const drawerVisible = ref(false);
  const selectedAgentId = ref<string | null>(null);

  const selectAgent = (id: string) => {
    console.log("selectAgent", id);
    selectedAgentId.value = id;
  };

  const resetSelection = () => {
    selectedAgentId.value = null;
  };

  const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value;
  };

  return {
    drawerVisible,
    toggleDrawer,
    selection: {
      selectedAgentId,
      selectAgent,
      resetSelection,
    },
  };
};
