import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

import { createDOMManager } from "@/dom";
import { useAgentStore } from "@/stores/agent";
import { useUIStore } from "@/stores/ui";

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  const pinia = createPinia();
  app.use(pinia);

  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  root.id = `plugin--shift-agents`;

  app.mount(root);

  sdk.navigation.addPage("/shift-agents", {
    body: root,
  });

  sdk.sidebar.registerItem("Shift Agents", "/shift-agents");

  useUIStore().toggleDrawer();

  sdk.replay.addToSlot("topbar", {
    type: "Button",
    label: "Agent",
    onClick: () => useUIStore().toggleDrawer(),
  });

  sdk.commands.register("shift-agents:toggle-drawer", {
    name: "Toggle Shift Agents Drawer",
    run: () => useUIStore().toggleDrawer(),
  });

  sdk.shortcuts.register("shift-agents:toggle-drawer", ["shift", "meta", "i"]);

  // TEMPORARY WORKAROUND FOR MISSING ONPAGECHANGE TYPE

  const pageChangeSubscribers = new Set<(page: string) => void>();

  // @ts-expect-error temporary workaround for missing onPageChange type
  sdk.navigation.onPageChange = (callback: (page: string) => void) => {
    pageChangeSubscribers.add(callback);
    return () => {
      pageChangeSubscribers.delete(callback);
    };
  };

  // @ts-expect-error temporary workaround for missing onPageChange type
  sdk.navigation.addPageChangeListener = (callback: (page: string) => void) => {
    pageChangeSubscribers.add(callback);
    return () => {
      pageChangeSubscribers.delete(callback);
    };
  };

  // @ts-expect-error temporary workaround for missing onPageChange type
  sdk.navigation.removePageChangeListener = (callback: (page: string) => void) => {
    pageChangeSubscribers.delete(callback);
  };

  let currentPage: string | undefined = undefined;
  setInterval(() => {
    const newPage = window.location.hash;
    if (currentPage !== newPage) {
      currentPage = newPage;
      // Notify all subscribers
      pageChangeSubscribers.forEach(callback => {
        try {
          callback(newPage);
        } catch (error) {
          console.error('Error in page change callback:', error);
        }
      });
    }
  }, 50);

  const domManager = createDOMManager(sdk);
  domManager.drawer.start();
  domManager.session.start();

  domManager.session.onSelected((sessionId) => {
    const agentStore = useAgentStore();
    if (sessionId !== undefined) {
      agentStore.selectAgent(sessionId);
    }
  });
};
