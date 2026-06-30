(() => {
  const activeSubjects = new Set(["physics", "chemistry"]);

  function normalizeSubjectId(subjectId) {
    const normalized = String(subjectId || "physics").toLowerCase();
    return activeSubjects.has(normalized) ? normalized : "physics";
  }

  function routeFromPath(pathname) {
    const path = (pathname || "/").replace(/\/+$/, "") || "/";
    const subjectMatch = path.match(/^\/subject\/([^/]+)$/);
    if (path === "/subjects") return { page: "subjects", subject: "" };
    if (subjectMatch) return { page: "library", subject: normalizeSubjectId(subjectMatch[1]) };
    if (path === "/chemistry") return { page: "library", subject: "chemistry" };
    if (path === "/physics" || path === "/physics.html") return { page: "library", subject: "physics" };
    return { page: "", subject: "" };
  }

  function textbookKeyFromName(textbook) {
    const value = String(textbook || "");
    if (value.includes("选择性必修三")) return "selective3";
    if (value.includes("选择性必修二")) return "selective2";
    if (value.includes("选择性必修一")) return "selective1";
    if (value.includes("必修二")) return "required2";
    return "required1";
  }

  function buildTextbookMeta(points) {
    const categories = {};
    const labels = {};
    (points || []).forEach((point) => {
      const key = point.textbookKey || textbookKeyFromName(point.textbook || point.chapter);
      const label = point.textbook || point.chapter || key;
      labels[key] = label;
      if (!categories[key]) categories[key] = [];
      const category = point.category || point.chapter || "知识点";
      if (!categories[key].includes(category)) categories[key].push(category);
    });
    return { categories, labels };
  }

  window.GrowthSubjectFramework = {
    normalizeSubjectId,
    routeFromPath,
    textbookKeyFromName,
    buildTextbookMeta,
  };
})();
