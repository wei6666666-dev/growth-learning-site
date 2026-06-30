(() => {
  const TYPE_LABELS = {
    knowledge: "知识点",
    video: "视频",
    mistake: "错题",
    material: "作文素材",
    score: "成绩记录",
  };

  function text(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join(" ");
    if (value == null) return "";
    if (typeof value === "object") return Object.values(value).map(text).join(" ");
    return String(value);
  }

  function createItem(type, id, title, source, fields, action) {
    return {
      id: `${type}:${id}`,
      rawId: id,
      type,
      typeLabel: TYPE_LABELS[type] || type,
      title: text(title),
      source: text(source),
      fields,
      action,
    };
  }

  function buildKnowledge(snapshot) {
    return (snapshot.knowledge || []).map((item) => createItem(
      "knowledge",
      item.id,
      item.name,
      `${item.textbook || ""} · ${item.category || ""}`,
      {
        title: [item.name],
        tag: [item.category, item.difficulty, item.textbook, ...(item.related || [])],
        body: [item.definition, item.summary, item.formula, item.symbols],
        weak: [item.mistakes, item.example, item.hint],
      },
      { kind: "knowledge", id: item.id }
    ));
  }

  function buildVideos(snapshot) {
    return (snapshot.videos || []).map((item) => createItem(
      "video",
      item.id,
      item.title,
      item.topic ? `Bilibili · ${item.topic}` : "Bilibili",
      {
        title: [item.title],
        tag: [item.topic, item.bv, item.status],
        body: [item.title, item.topic],
        weak: [item.bv],
      },
      { kind: "video", id: item.id, topic: item.topic }
    ));
  }

  function buildMistakes(snapshot) {
    return (snapshot.mistakes || []).map((item) => createItem(
      "mistake",
      item.id,
      item.question || `${item.subject || ""}错题`,
      `${item.subject || ""} · ${item.topic || ""}`,
      {
        title: [item.question],
        tag: [item.subject, item.topic],
        body: [item.reason, item.solution],
        weak: [item.mastered ? "已掌握" : "待复习"],
      },
      { kind: "mistake", id: item.id }
    ));
  }

  function buildMaterials(snapshot) {
    return (snapshot.materials || []).map((item) => createItem(
      "material",
      item.id,
      item.title,
      `作文素材 · ${item.theme || ""}`,
      {
        title: [item.title],
        tag: [item.theme, item.custom ? "我的素材" : "预置素材"],
        body: [item.content],
        weak: [item.favorite ? "收藏" : ""],
      },
      { kind: "material", id: item.id }
    ));
  }

  function buildScores(snapshot) {
    return (snapshot.scores || []).map((item) => createItem(
      "score",
      item.id,
      item.examName || `${item.subject || ""}成绩`,
      `${item.grade || ""} · ${item.subject || ""} · ${item.date || ""}`,
      {
        title: [item.examName],
        tag: [item.grade, item.subject],
        body: [`${item.score || 0}/${item.fullScore || 0}`, item.date],
        note: [item.note],
        weak: [item.classRank ? `班级排名 ${item.classRank}` : "", item.gradeRank ? `年级排名 ${item.gradeRank}` : ""],
      },
      { kind: "score", id: item.id }
    ));
  }

  function buildIndex() {
    const snapshot = window.GrowthSearchData?.getSnapshot?.() || {};
    return [
      ...buildKnowledge(snapshot),
      ...buildVideos(snapshot),
      ...buildMistakes(snapshot),
      ...buildMaterials(snapshot),
      ...buildScores(snapshot),
    ];
  }

  window.GrowthSearchIndex = {
    buildIndex,
  };
})();
