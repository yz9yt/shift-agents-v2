import { useDrawerManager } from "@/dom/drawer";
import { useSessionManager } from "@/dom/session";
import { type FrontendSDK } from "@/types";

export const createDOMManager = (sdk: FrontendSDK) => {
  const drawer = useDrawerManager(sdk);
  const session = useSessionManager(sdk);

  return {
    drawer,
    session,
    stop: () => {
      drawer.stop();
      session.stop();
    },
  };
};
