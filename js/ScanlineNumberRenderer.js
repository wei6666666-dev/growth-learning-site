(() => {
  class ScanlineNumberRenderer {
    constructor(root) {
      this.root = root;
      this.value = "";
      this.density = "medium";
    }

    render(value, options = {}) {
      this.value = String(value);
      this.density = options.density || "medium";
      this.root.dataset.density = this.density;
      this.root.setAttribute("aria-label", `${this.value} 天`);
      this.root.innerHTML = "";

      [...this.value].forEach((digit) => {
        const digitNode = document.createElement("span");
        digitNode.className = "scan-digit";
        digitNode.dataset.digit = digit;
        digitNode.textContent = digit;
        this.root.appendChild(digitNode);
      });
    }
  }

  window.ScanlineNumberRenderer = ScanlineNumberRenderer;
})();
