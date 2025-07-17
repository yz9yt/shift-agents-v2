import { useDrawerManager } from "@/dom/drawer";
import { useSessionManager } from "@/dom/session";
import { FrontendSDK } from "@/types";

export const createDOMManager = (sdk: FrontendSDK) => {
  return {
    drawer: useDrawerManager(sdk),
    session: useSessionManager(sdk),
  };
};
