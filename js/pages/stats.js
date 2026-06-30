(() => {
  function renderStats(state) {
    return { page: "stats", scores: state.scores || [], grade: state.grade };
  }

  window.GrowthPages = {
    ...(window.GrowthPages || {}),
    renderStats,
  };
})();
