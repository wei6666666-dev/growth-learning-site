(() => {
  const FIELD_WEIGHTS = {
    title: 100,
    tag: 80,
    body: 50,
    weak: 40,
    note: 20,
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function splitTerms(query) {
    const raw = String(query || "").trim().toLowerCase();
    if (!raw) return [];
    const spaced = raw.split(/\s+/).filter(Boolean);
    return spaced.length > 1 ? spaced : [raw];
  }

  function fuzzyIncludes(source, term) {
    const compactSource = normalize(source);
    const compactTerm = normalize(term);
    if (!compactTerm) return false;
    if (compactSource.includes(compactTerm)) return true;
    let cursor = 0;
    for (const char of compactTerm) {
      cursor = compactSource.indexOf(char, cursor);
      if (cursor === -1) return false;
      cursor += 1;
    }
    return compactTerm.length >= 2;
  }

  function fieldText(values) {
    return (Array.isArray(values) ? values : [values])
      .flat(Infinity)
      .filter(Boolean)
      .join(" ");
  }

  function scoreItem(item, terms) {
    let score = 0;
    const matched = [];
    Object.entries(item.fields || {}).forEach(([field, values]) => {
      const haystack = fieldText(values);
      const baseWeight = FIELD_WEIGHTS[field] || 30;
      terms.forEach((term) => {
        const direct = normalize(haystack).includes(normalize(term));
        if (direct || fuzzyIncludes(haystack, term)) {
          score += direct ? baseWeight : Math.round(baseWeight * 0.58);
          matched.push({ field, term, text: haystack });
        }
      });
    });
    return { score, matched };
  }

  function makeExcerpt(item, matched) {
    const first = matched[0]?.text || item.fields?.body?.[0] || item.fields?.weak?.[0] || item.source || "";
    return String(first).replace(/\s+/g, " ").slice(0, 96);
  }

  function highlight(text, terms) {
    let result = String(text || "");
    terms
      .filter((term) => term && term.length)
      .sort((a, b) => b.length - a.length)
      .forEach((term) => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(escaped, "gi"), (match) => `<mark>${match}</mark>`);
      });
    return result;
  }

  function search(index, query, limit = 30) {
    const terms = splitTerms(query);
    if (!terms.length) return [];
    return (index || [])
      .map((item) => {
        const result = scoreItem(item, terms);
        return {
          ...item,
          score: result.score,
          excerpt: makeExcerpt(item, result.matched),
          terms,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"))
      .slice(0, limit);
  }

  window.GrowthSearchEngine = {
    search,
    highlight,
  };
})();
