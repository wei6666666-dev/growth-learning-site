(() => {
  const VALID_PAGES = new Set(["home", "library", "mistakes", "materials", "stats"]);

  function normalizePage(page) {
    return VALID_PAGES.has(page) ? page : "home";
  }

  function renderApp(appState) {
    const page = normalizePage(appState.currentPage);
    document.body.dataset.activePage = page;

    document.querySelectorAll(".page-view").forEach((view) => {
      view.classList.toggle("active", view.dataset.pageView === page);
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

  window.GrowthRender = {
    renderApp,
    attachRenderer,
  };
})();
