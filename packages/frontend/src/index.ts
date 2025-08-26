// modified by Albert.C Date 2025-08-22 Version 0.01
import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

import { createDOMManager } from "@/dom";
import { useAgentsStore } from "@/stores/agents";
import { useUIStore } from "@/stores/ui";

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  app.directive("tooltip", Tooltip);

  const pinia = createPinia();
  app.use(pinia);

  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  root.id = `plugin--shift-agents-v2`;

  app.mount(root);

  sdk.navigation.addPage("/shift-agents-v2", {
    body: root,
  });

  sdk.sidebar.registerItem("Shift Agents v2", "/shift-agents-v2", {
    icon: "fas fa-robot",
  });

  sdk.replay.addToSlot("topbar", {
    type: "Button",
    label: "Agent",
    onClick: () => useUIStore().toggleDrawer(),
  });

  sdk.commands.register("shift-agents-v2:toggle-drawer", {
    name: "Toggle Shift Agents v2 Drawer",
    run: () => useUIStore().toggleDrawer(),
  });

  sdk.shortcuts.register("shift-agents-v2:toggle-drawer", ["shift", "meta", "i"]);

  const domManager = createDOMManager(sdk);
  domManager.drawer.start();
  domManager.session.start();

  domManager.session.onSelected((sessionId) => {
    const agentStore = useAgentsStore();
    if (sessionId !== undefined) {
      agentStore.selectAgent(sessionId);
    }
  });
};
