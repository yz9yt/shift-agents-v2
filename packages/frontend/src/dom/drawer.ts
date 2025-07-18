import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { type App, createApp } from "vue";

import { Drawer } from "@/components/drawer";
import { type FrontendSDK } from "@/types";

export const useDrawerManager = (sdk: FrontendSDK) => {
  let app: App | undefined = undefined;

  const start = () => {
    // @ts-expect-error temporary workaround for missing onPageChange type
    sdk.navigation.onPageChange = (page) => {
      console.log("onPageChange", page);
      if (page === "#/replay") {
        inject();
      } else {
        remove();
      }
    };
  };

  const inject = () => {
    displayDrawer(document.body);
  };

  const remove = () => {
    if (app) {
      app.unmount();
      app = undefined;
    }
  };

  const displayDrawer = (root: Element) => {
    const container = document.createElement("div");
    container.className = "shift-agents-injection";
    container.id = "plugin--shift-agents";

    root.appendChild(container);

    if (!app) {
      app = createApp(Drawer, {});
      app.use(PrimeVue, {
        unstyled: true,
        pt: Classic,
      });
    }
    app.mount(container);
  };

  return {
    start,
  };
};
