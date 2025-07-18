import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("stores.ui", () => {
  const drawerVisible = ref(false);

  const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value;
  };

  return {
    drawerVisible,
    toggleDrawer,
  };
});
