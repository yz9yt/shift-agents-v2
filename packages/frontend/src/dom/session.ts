import { type FrontendSDK } from "@/types";

export const useSessionManager = (sdk: FrontendSDK) => {
  let currentSelectedId: string | undefined = undefined;
  let observer: MutationObserver | undefined = undefined;
  let onSelectedCallback:
    | ((sessionId: string | undefined) => void)
    | undefined = undefined;

  const start = () => {
    observeSessionChanges();
  };

  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };

  const onSelected = (callback: (sessionId: string | undefined) => void) => {
    onSelectedCallback = callback;
  };

  const observeSessionChanges = () => {
    const treeCollection = document.querySelector(".c-tree-collection");
    if (!treeCollection) {
      setTimeout(observeSessionChanges, 100);
      return;
    }

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-is-selected"
        ) {
          const target = mutation.target as Element;
          if (target.classList.contains("c-tree-session")) {
            const isSelected =
              target.getAttribute("data-is-selected") === "true";
            const sessionId =
              target.getAttribute("data-session-id") ?? undefined;

            if (
              isSelected &&
              sessionId !== undefined &&
              sessionId !== currentSelectedId
            ) {
              currentSelectedId = sessionId;
              if (onSelectedCallback) {
                onSelectedCallback(sessionId);
              }
            } else if (!isSelected && sessionId === currentSelectedId) {
              currentSelectedId = undefined;
              if (onSelectedCallback) {
                onSelectedCallback(undefined);
              }
            }
          }
        }
      });
    });

    observer.observe(treeCollection, {
      attributes: true,
      attributeFilter: ["data-is-selected"],
      subtree: true,
    });

    const initialSelected = treeCollection.querySelector(
      '.c-tree-session[data-is-selected="true"]',
    );
    if (initialSelected) {
      const sessionId =
        initialSelected.getAttribute("data-session-id") ?? undefined;
      if (sessionId !== undefined) {
        currentSelectedId = sessionId;
        if (onSelectedCallback) {
          onSelectedCallback(sessionId);
        }
      }
    }
  };

  return {
    start,
    stop,
    onSelected,
  };
};
