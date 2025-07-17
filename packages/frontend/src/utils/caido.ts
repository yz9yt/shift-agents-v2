export const getCurrentlySelectedReplayTabSessionId = () => {
  const activeTab = document.querySelector(
    '[data-is-selected="true"][data-session-id]'
  );
  return activeTab ? activeTab.getAttribute("data-session-id") : "";
};
