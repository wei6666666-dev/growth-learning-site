(() => {
  function linePoints(values = []) {
    return values.map((value, index) => ({ index, value: Number(value) || 0 }));
  }

  window.GrowthComponents = {
    ...(window.GrowthComponents || {}),
    linePoints,
  };
})();
