import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { createApp, type App } from "vue";
import { type FrontendSDK } from "@/types";
import { Drawer } from "@/components/drawer";

export const useDrawerManager = (sdk: FrontendSDK) => {
  let app: App | null = null;

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
      app = null;
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
