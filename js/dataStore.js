(() => {
  const SCORE_KEY = "growth_scores";
  const SCORE_VERSION = 1;
  const VALID_GRADES = new Set(["\u9ad8\u4e00", "\u9ad8\u4e8c", "\u9ad8\u4e09"]);

  function nowISO() {
    return new Date().toISOString();
  }

  function makeId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `score-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function readPayload() {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (!raw) return { version: SCORE_VERSION, data: [] };
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { version: SCORE_VERSION, data: parsed };
      if (parsed?.version === SCORE_VERSION && Array.isArray(parsed.data)) return parsed;
      return { version: SCORE_VERSION, data: [] };
    } catch {
      return { version: SCORE_VERSION, data: [] };
    }
  }

  function normalizeNullableNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeScore(item) {
    const score = Number(item?.score);
    const fullScore = Number(item?.fullScore);
    const grade = item?.grade;
    const examName = String(item?.examName || "").trim();
    const subject = String(item?.subject || "").trim();
    const date = String(item?.date || "").trim();
    return {
      id: String(item?.id || makeId()),
      grade,
      examName,
      date,
      subject,
      score,
      fullScore,
      classRank: normalizeNullableNumber(item?.classRank),
      gradeRank: normalizeNullableNumber(item?.gradeRank),
      totalStudents: normalizeNullableNumber(item?.totalStudents),
      note: String(item?.note || "").trim(),
      createdAt: item?.createdAt || nowISO(),
    };
  }

  function validateScore(item) {
    const score = normalizeScore(item);
    if (!score.id || !VALID_GRADES.has(score.grade)) return false;
    if (!score.examName || !score.date || !score.subject) return false;
    if (!Number.isFinite(score.score) || !Number.isFinite(score.fullScore)) return false;
    if (score.score < 0 || score.fullScore <= 0 || score.score > score.fullScore) return false;
    if (score.classRank !== null && score.classRank < 1) return false;
    if (score.gradeRank !== null && score.gradeRank < 1) return false;
    if (score.totalStudents !== null && score.totalStudents < 1) return false;
    return true;
  }

  function writeScores(data) {
    const clean = Array.isArray(data) ? data.map(normalizeScore).filter(validateScore) : [];
    localStorage.setItem(SCORE_KEY, JSON.stringify({ version: SCORE_VERSION, data: clean }));
    return clean;
  }

  function getScores() {
    return readPayload().data.map(normalizeScore).filter(validateScore);
  }

  function setScores(data) {
    return writeScores(data);
  }

  function addScore(item) {
    const score = normalizeScore(item);
    if (!validateScore(score)) throw new Error("Invalid score data");
    const next = [score, ...getScores()];
    writeScores(next);
    return score;
  }

  function deleteScore(id) {
    const next = getScores().filter((item) => item.id !== id);
    writeScores(next);
    return next;
  }

  function updateScore(id, newData) {
    const next = getScores().map((item) => item.id === id ? { ...item, ...newData, id } : item);
    return writeScores(next);
  }

  function clearScores() {
    localStorage.setItem(SCORE_KEY, JSON.stringify({ version: SCORE_VERSION, data: [] }));
    return [];
  }

  window.GrowthDataStore = {
    SCORE_KEY,
    SCORE_VERSION,
    validateScore,
    getScores,
    setScores,
    addScore,
    deleteScore,
    updateScore,
    clearScores,
    sync: async () => ({ ok: true, source: "localStorage" }),
    user: async () => null,
  };
})();
