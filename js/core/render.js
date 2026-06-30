(() => {
  const VALID_PAGES = new Set(["home", "library", "mistakes", "materials", "stats"]);

  function normalizePage(page) {
    return VALID_PAGES.has(page) ? page : "home";
  }

  function clearStatsDom() {
    [
      "#statsHeroData",
      "#statsGrid",
      "#scoreChart",
      "#rankChart",
      "#subjectGrid",
      "#examTimeline",
    ].forEach((selector) => {
      const node = document.querySelector(selector);
      if (node) node.replaceChildren();
    });
    document.querySelector("#analyticsSurface")?.classList.remove("switching");
  }

  function cleanupInactivePages(page) {
    if (page !== "stats") clearStatsDom();
  }

  function renderApp(appState) {
    const page = normalizePage(appState.currentPage);
    document.body.dataset.activePage = page;
    cleanupInactivePages(page);

    document.querySelectorAll(".page-view").forEach((view) => {
      const isActive = view.dataset.pageView === page;
      view.classList.toggle("active", isActive);
      view.hidden = !isActive;
      view.setAttribute("aria-hidden", String(!isActive));
      view.inert = !isActive;
    });

    document.querySelectorAll(".nav-trigger").forEach((button) => {
      button.classList.toggle("active", button.dataset.page === page);
    });
  }

  function attachRenderer() {
    if (!window.GrowthAppState) return;
    window.GrowthAppState.subscribe((state) => renderApp(state));
    renderApp(window.GrowthAppState.getState());
  }

  function renderPage(route, patch = {}) {
    const page = normalizePage(route);
    if (window.GrowthAppState) {
      window.GrowthAppState.setState({ ...patch, currentPage: page });
      return;
    }
    renderApp({ ...patch, currentPage: page });
  }

  window.GrowthRender = {
    renderApp,
    renderPage,
    cleanupInactivePages,
    attachRenderer,
  };
})();
