(() => {
  function renderPhysics(state) {
    return { page: "physics", physics: state.physics || {} };
  }

  window.GrowthPages = {
    ...(window.GrowthPages || {}),
    renderPhysics,
  };
})();
