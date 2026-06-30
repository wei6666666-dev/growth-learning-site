(() => {
  const STORAGE_KEY = "growth-gaokao-countdown";
  const DEFAULT_DATA = {
    targetDate: "2029-06-07",
    title: "高考倒计时",
    showUnit: true,
    theme: "scanline",
    density: "medium",
  };

  const validDensity = new Set(["sparse", "medium", "dense"]);
  const validTheme = new Set(["scanline", "minimal"]);

  function normalize(data = {}) {
    return {
      targetDate: typeof data.targetDate === "string" && data.targetDate ? data.targetDate : DEFAULT_DATA.targetDate,
      title: typeof data.title === "string" && data.title ? data.title : DEFAULT_DATA.title,
      showUnit: typeof data.showUnit === "boolean" ? data.showUnit : DEFAULT_DATA.showUnit,
      theme: validTheme.has(data.theme) ? data.theme : DEFAULT_DATA.theme,
      density: validDensity.has(data.density) ? data.density : DEFAULT_DATA.density,
    };
  }

  function get() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return normalize(saved);
    } catch {
      return { ...DEFAULT_DATA };
    }
  }

  function set(nextData) {
    const data = normalize(nextData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  function update(patch) {
    return set({ ...get(), ...patch });
  }

  function daysLeft(targetDate) {
    const target = new Date(`${targetDate}T00:00:00`);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (Number.isNaN(target.getTime())) return 0;
    return Math.max(0, Math.ceil((target - today) / 86400000));
  }

  function formatDate(targetDate) {
    const target = new Date(`${targetDate}T00:00:00`);
    if (Number.isNaN(target.getTime())) return "目标日期：未设置";
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    return `目标日期：${y}/${m}/${d}`;
  }

  window.CountdownStore = {
    key: STORAGE_KEY,
    defaultData: DEFAULT_DATA,
    get,
    set,
    update,
    daysLeft,
    formatDate,
  };
})();
