(() => {
  const DEFAULT_STATE = {
    user: {},
    currentPage: "home",
    grade: "高一",
    scores: [],
    physics: {},
    tasks: [],
    settings: {},
    ui: {
      loading: false,
      modal: null,
    },
  };

  let state = structuredClone(DEFAULT_STATE);
  const listeners = new Set();

  function clone(value) {
    return structuredClone(value);
  }

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function merge(base, patch) {
    const next = { ...base };
    Object.entries(patch || {}).forEach(([key, value]) => {
      next[key] = isPlainObject(value) && isPlainObject(base[key])
        ? merge(base[key], value)
        : value;
    });
    return next;
  }

  function getState() {
    return clone(state);
  }

  function setState(partial = {}, options = {}) {
    const previous = state;
    state = merge(state, partial);
    if (!options.silent) {
      listeners.forEach((listener) => listener(getState(), clone(previous)));
    }
    return getState();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function reset(nextState = {}) {
    state = merge(structuredClone(DEFAULT_STATE), nextState);
    listeners.forEach((listener) => listener(getState(), structuredClone(DEFAULT_STATE)));
    return getState();
  }

  window.GrowthAppState = {
    DEFAULT_STATE,
    getState,
    setState,
    subscribe,
    reset,
  };
})();
