// Externalized from chat-bubble.html so the app can run under a strict CSP
// (script-src 'self', no 'unsafe-inline'). See tauri.conf.json security.csp.
const params = new URLSearchParams(window.location.search);
const text = params.get("text") || "…";
const id = params.get("id") || "bubble";
document.getElementById("text").textContent = text;

window.addEventListener("DOMContentLoaded", async () => {
  if (window.__TAURI__) {
    const { emit } = window.__TAURI__.event;
    const bubble = document.getElementById("bubble");

    const reportSize = async () => {
      const rect = bubble.getBoundingClientRect();

      const width = rect.width + 10;
      const height = rect.height + 10;

      await emit("bubble_resize", { width, height, id });
    };

    // Use ResizeObserver to detect when fonts load or layout settles
    const observer = new ResizeObserver(() => {
      reportSize();
    });
    observer.observe(bubble);

    // Also report immediately
    setTimeout(reportSize, 50);
  }
});
