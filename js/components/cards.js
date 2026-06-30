(() => {
  function card(content = "", className = "") {
    return `<article class="panel ${className}">${content}</article>`;
  }

  window.GrowthComponents = {
    ...(window.GrowthComponents || {}),
    card,
  };
})();
