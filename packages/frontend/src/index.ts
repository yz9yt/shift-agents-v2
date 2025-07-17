import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";
import { createPinia } from "pinia";
import { useAgentStore } from "@/stores";
import { createDOMManager } from "@/dom";

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

  sdk.replay.addToSlot("topbar", {
    type: "Button",
    label: "Agent",
    onClick: () => {
      const agentStore = useAgentStore();
      agentStore.toggleDrawer();
    },
  });

  // TEMPORARY WORKAROUND FOR MISSING ONPAGECHANGE TYPE

  // @ts-expect-error temporary workaround for missing onPageChange type
  sdk.navigation.onPageChange = () => {};

  let currentPage: string | undefined = undefined;
  setInterval(() => {
    const newPage = window.location.hash;
    if (currentPage !== newPage) {
      currentPage = newPage;
      // @ts-expect-error temporary workaround for missing onPageChange type
      sdk.navigation.onPageChange(newPage);
    }
  }, 50);

  const domManager = createDOMManager(sdk);
  domManager.drawer.start();
  domManager.session.start();

  domManager.session.onSelected((sessionId) => {
    const agentStore = useAgentStore();
    if (sessionId) {
      if (!agentStore.getAgent(sessionId)) {
        agentStore.createAgentFromSessionId(sessionId);
      }
      agentStore.selection.selectAgent(sessionId);
    }
  });
};
