const CACHE_NAME = "growth-pwa-v41";
const APP_SHELL = [
  "/",
  "/index.html",
  "/physics.html",
  "/mistakes.html",
  "/statistics.html",
  "/css/style.css?v=20260630-route-cleanup",
  "/js/dataStore.js?v=20260629-data-layer",
  "/js/store/appState.js?v=20260630-state-architecture",
  "/js/core/store.js?v=20260630-state-architecture",
  "/js/core/persist.js?v=20260630-state-architecture",
  "/js/core/render.js?v=20260630-route-cleanup",
  "/js/pages/home.js?v=20260630-state-architecture",
  "/js/pages/stats.js?v=20260630-state-architecture",
  "/js/pages/physics.js?v=20260630-state-architecture",
  "/js/components/cards.js?v=20260630-state-architecture",
  "/js/components/charts.js?v=20260630-state-architecture",
  "/js/components/navbar.js?v=20260630-state-architecture",
  "/js/countdownStore.js?v=20260630-countdown-modal",
  "/js/ScanlineNumberRenderer.js?v=20260630-countdown-modal",
  "/js/CountdownCard.js?v=20260630-countdown-modal-2",
  "/js/supabase-config.js?v=20260629-supabase",
  "/js/script.js?v=20260630-route-cleanup",
  "/data/physics.json",
  "/manifest.json",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/index.html")))
    );
    return;
  }

  if (url.pathname === "/data/physics.json" || url.pathname === "/js/supabase-config.js" || url.pathname === "/js/dataStore.js") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
