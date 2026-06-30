(() => {
  function setActiveNav(page) {
    document.querySelectorAll(".nav-trigger").forEach((button) => {
      button.classList.toggle("active", button.dataset.page === page);
    });
  }

  window.GrowthComponents = {
    ...(window.GrowthComponents || {}),
    setActiveNav,
  };
})();
