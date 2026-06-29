(() => {
  const SELECTORS = {
    root: "[data-countdown-root]",
    card: "[data-countdown-card]",
    number: "[data-scanline-number]",
    target: "[data-countdown-target]",
    dateLabel: "[data-countdown-target-label]",
    unit: "[data-countdown-unit]",
    density: "[data-countdown-density-value]",
    showUnit: "[data-countdown-show-unit]",
  };

  class CountdownCard {
    constructor(root) {
      this.root = root;
      this.card = root.querySelector(SELECTORS.card);
      this.number = root.querySelector(SELECTORS.number);
      this.renderer = new window.ScanlineNumberRenderer(this.number);
      this.data = window.CountdownStore.get();
      this.midnightTimer = null;
      this.bind();
      this.render();
      this.scheduleDailyRefresh();
    }

    bind() {
      const target = this.root.querySelector(SELECTORS.target);
      target?.addEventListener("input", (event) => {
        this.data = window.CountdownStore.update({ targetDate: event.target.value });
        this.render();
      });

      this.root.querySelectorAll(SELECTORS.density).forEach((button) => {
        button.addEventListener("click", () => {
          this.data = window.CountdownStore.update({ density: button.dataset.countdownDensityValue });
          this.render();
        });
      });

      this.root.querySelector(SELECTORS.showUnit)?.addEventListener("change", (event) => {
        this.data = window.CountdownStore.update({ showUnit: event.target.checked });
        this.render();
      });
    }

    render() {
      const days = window.CountdownStore.daysLeft(this.data.targetDate);
      const padded = String(days).padStart(3, "0");
      const target = this.root.querySelector(SELECTORS.target);
      if (target) target.value = this.data.targetDate;
      this.card.dataset.density = this.data.density;
      this.renderer.render(padded, { density: this.data.density });
      this.root.querySelector(SELECTORS.dateLabel).textContent = window.CountdownStore.formatDate(this.data.targetDate);
      this.root.querySelector(SELECTORS.unit).hidden = !this.data.showUnit;
      this.root.querySelector(SELECTORS.showUnit).checked = this.data.showUnit;
      this.root.querySelectorAll(SELECTORS.density).forEach((button) => {
        button.classList.toggle("active", button.dataset.countdownDensityValue === this.data.density);
      });
    }

    scheduleDailyRefresh() {
      clearTimeout(this.midnightTimer);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      this.midnightTimer = setTimeout(() => {
        this.render();
        this.scheduleDailyRefresh();
      }, next - now);
    }
  }

  function initCountdownCards() {
    document.querySelectorAll(SELECTORS.root).forEach((root) => new CountdownCard(root));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCountdownCards);
  } else {
    initCountdownCards();
  }

  window.CountdownCard = CountdownCard;
})();
