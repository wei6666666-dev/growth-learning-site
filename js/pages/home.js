(() => {
  function renderHome(state) {
    return { page: "home", tasks: state.tasks || [] };
  }

  window.GrowthPages = {
    ...(window.GrowthPages || {}),
    renderHome,
  };
})();
