(() => {
  const RECENT_KEY = "growth_global_search_recent";
  const MAX_RECENT = 6;
  const state = {
    open: false,
    query: "",
    activeIndex: 0,
    index: [],
    results: [],
    timer: null,
  };

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function debounce(fn, wait = 150) {
    clearTimeout(state.timer);
    state.timer = setTimeout(fn, wait);
  }

  function readRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeRecent(item) {
    const recent = [item, ...readRecent().filter((old) => old.id !== item.id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }

  function ensureModal() {
    if (document.querySelector("#globalSearchModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="global-search-modal" id="globalSearchModal" aria-hidden="true">
        <div class="global-search-backdrop" data-search-close></div>
        <section class="global-search-panel" role="dialog" aria-modal="true" aria-label="全站搜索">
          <div class="global-search-input-row">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg>
            <input id="globalSearchCommandInput" type="search" autocomplete="off" placeholder="搜索知识点、公式、错题、作文、成绩..." />
            <kbd>Esc</kbd>
          </div>
          <div class="global-search-body" id="globalSearchBody"></div>
        </section>
      </div>
    `);
  }

  function buildIndex() {
    state.index = window.GrowthSearchIndex?.buildIndex?.() || [];
  }

  function groupResults(results) {
    return results.reduce((groups, item) => {
      if (!groups.has(item.typeLabel)) groups.set(item.typeLabel, []);
      groups.get(item.typeLabel).push(item);
      return groups;
    }, new Map());
  }

  function resultHTML(item, index) {
    const highlighter = window.GrowthSearchEngine?.highlight || escapeHTML;
    const title = highlighter(escapeHTML(item.title), item.terms || []);
    const excerpt = highlighter(escapeHTML(item.excerpt || item.source), item.terms || []);
    return `<button class="global-search-result ${index === state.activeIndex ? "active" : ""}" type="button" data-search-result="${index}">
      <span class="result-type">${escapeHTML(item.typeLabel)}</span>
      <strong>${title}</strong>
      <small>${excerpt}</small>
      <em>${escapeHTML(item.source)}</em>
    </button>`;
  }

  function emptyStateHTML() {
    return `<div class="global-search-empty">
      <strong>没有找到相关内容</strong>
      <p>换个关键词试试，比如 位移、牛顿、作文、月考。</p>
    </div>`;
  }

  function defaultStateHTML() {
    const recent = readRecent();
    const favorites = (state.index || []).filter((item) => {
      const snapshot = window.GrowthSearchData?.getSnapshot?.() || {};
      const fav = snapshot.favorites || {};
      return fav.knowledge?.includes(item.rawId) || fav.materials?.includes(item.rawId) || fav.videos?.includes(item.rawId);
    }).slice(0, 5);
    const entries = [
      { title: "打开物理知识库", source: "常用入口", typeLabel: "入口", action: { kind: "page", page: "library" } },
      { title: "查看学习统计", source: "常用入口", typeLabel: "入口", action: { kind: "page", page: "stats" } },
      { title: "整理错题本", source: "常用入口", typeLabel: "入口", action: { kind: "page", page: "mistakes" } },
    ];
    const sections = [];
    if (recent.length) sections.push(`<div class="global-search-group"><h3>最近访问</h3>${recent.map((item, i) => resultHTML({ ...item, terms: [] }, i)).join("")}</div>`);
    if (favorites.length) sections.push(`<div class="global-search-group"><h3>最近收藏</h3>${favorites.map((item, i) => resultHTML({ ...item, terms: [] }, recent.length + i)).join("")}</div>`);
    sections.push(`<div class="global-search-group"><h3>常用入口</h3>${entries.map((item, i) => resultHTML({ ...item, id: `entry:${i}`, rawId: `entry:${i}`, terms: [] }, recent.length + favorites.length + i)).join("")}</div>`);
    state.results = [...recent, ...favorites, ...entries];
    return sections.join("");
  }

  function render() {
    const body = document.querySelector("#globalSearchBody");
    if (!body) return;
    if (!state.query.trim()) {
      body.innerHTML = defaultStateHTML();
      return;
    }
    if (!state.results.length) {
      body.innerHTML = emptyStateHTML();
      return;
    }
    let cursor = 0;
    body.innerHTML = [...groupResults(state.results)].map(([label, items]) => {
      const html = items.map((item) => resultHTML(item, cursor++)).join("");
      return `<div class="global-search-group"><h3>${escapeHTML(label)}</h3>${html}</div>`;
    }).join("");
  }

  function runSearch() {
    buildIndex();
    state.results = window.GrowthSearchEngine?.search?.(state.index, state.query, 30) || [];
    state.activeIndex = 0;
    render();
  }

  function open() {
    ensureModal();
    buildIndex();
    state.open = true;
    state.query = "";
    state.results = [];
    state.activeIndex = 0;
    document.querySelector("#globalSearchModal").classList.add("open");
    document.querySelector("#globalSearchModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("search-open");
    render();
    setTimeout(() => document.querySelector("#globalSearchCommandInput")?.focus(), 40);
  }

  function close() {
    state.open = false;
    document.querySelector("#globalSearchModal")?.classList.remove("open");
    document.querySelector("#globalSearchModal")?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-open");
  }

  function openAction(item) {
    if (!item) return;
    writeRecent({
      id: item.id,
      rawId: item.rawId,
      type: item.type,
      typeLabel: item.typeLabel,
      title: item.title,
      source: item.source,
      excerpt: item.excerpt || item.source,
      action: item.action,
    });
    close();
    const action = item.action || {};
    if (action.kind === "page") window.GrowthSearchData?.openPage?.(action.page);
    if (action.kind === "knowledge") window.GrowthSearchData?.openKnowledge?.(action.id);
    if (action.kind === "video") window.GrowthSearchData?.openVideo?.(action.id, action.topic);
    if (action.kind === "mistake") window.GrowthSearchData?.openMistake?.(action.id);
    if (action.kind === "material") window.GrowthSearchData?.openMaterial?.(action.id);
    if (action.kind === "score") window.GrowthSearchData?.openScore?.(action.id);
  }

  function move(delta) {
    if (!state.results.length) return;
    state.activeIndex = (state.activeIndex + delta + state.results.length) % state.results.length;
    render();
    document.querySelector(`[data-search-result="${state.activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }

  function bind() {
    ensureModal();
    const topInput = document.querySelector("#globalSearch");
    if (topInput) {
      topInput.readOnly = true;
      topInput.placeholder = "全站搜索  Ctrl K";
      topInput.addEventListener("focus", open);
      topInput.addEventListener("click", open);
    }

    document.addEventListener("keydown", (event) => {
      const isCommand = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommand) {
        event.preventDefault();
        open();
        return;
      }
      if (!state.open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        openAction(state.results[state.activeIndex]);
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-search-close]")) close();
      const result = event.target.closest("[data-search-result]");
      if (result) openAction(state.results[Number(result.dataset.searchResult)]);
    });

    document.addEventListener("input", (event) => {
      if (!event.target.matches("#globalSearchCommandInput")) return;
      state.query = event.target.value;
      debounce(runSearch, 150);
    });
  }

  window.GrowthGlobalSearch = {
    open,
    close,
    rebuild: buildIndex,
  };

  bind();
})();
