(() => {
  const KEYS = {
    tasks: "growth_state_tasks",
    physics: "growth_state_physics",
    settings: "growth_state_settings",
  };
  const LEGACY_KEY = "growth-interactive-learning";
  const SAVE_DELAY = 500;
  let saveTimer = null;

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function readLegacy() {
    return readJSON(LEGACY_KEY, {}) || {};
  }

  function readInitialState() {
    const legacy = readLegacy();
    return {
      currentPage: document.body?.dataset.initialPage || "home",
      grade: legacy.activeGrade || "高一",
      scores: window.GrowthDataStore?.getScores?.() || [],
      tasks: readJSON(KEYS.tasks, legacy.tasks || []),
      physics: readJSON(KEYS.physics, {
        activeTextbook: legacy.activeTextbook || "required1",
        activeCategory: legacy.activeCategory || "",
        masteredKnowledge: legacy.masteredKnowledge || [],
        learningKnowledge: legacy.learningKnowledge || [],
        knowledgeFavorites: legacy.knowledgeFavorites || [],
        notes: legacy.notes || {},
        videos: legacy.videos || [],
        mistakes: legacy.mistakes || [],
      }),
      settings: readJSON(KEYS.settings, {
        theme: localStorage.getItem("growth-theme") || "",
      }),
    };
  }

  function writeState(state) {
    if (window.GrowthDataStore?.setScores) window.GrowthDataStore.setScores(state.scores || []);
    localStorage.setItem(KEYS.tasks, JSON.stringify(state.tasks || []));
    localStorage.setItem(KEYS.physics, JSON.stringify(state.physics || {}));
    localStorage.setItem(KEYS.settings, JSON.stringify(state.settings || {}));
  }

  function attach() {
    if (!window.GrowthAppState) return;
    window.GrowthAppState.setState(readInitialState(), { silent: true });
    window.GrowthAppState.subscribe((state) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => writeState(state), SAVE_DELAY);
    });
  }

  window.GrowthPersist = {
    KEYS,
    readInitialState,
    writeState,
    attach,
  };
})();
