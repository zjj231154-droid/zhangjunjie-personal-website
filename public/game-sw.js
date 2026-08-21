const CACHE_NAME = "mystery-world-v5";
const SCOPE_URL = new URL(self.registration.scope);
const GAME_URL = new URL("mystery.html", SCOPE_URL).href;
const SHORT_URL = new URL("mystery", SCOPE_URL).href;
const GAME_ROUTE_URL = new URL("game", SCOPE_URL).href;
const CORE = [GAME_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("mystery-world-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const relativePath = url.pathname.startsWith(SCOPE_URL.pathname)
    ? url.pathname.slice(SCOPE_URL.pathname.length)
    : "";

  if (relativePath.startsWith("assets/") || relativePath === "game-sw.js") {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      })),
    );
    return;
  }

  if ([SHORT_URL, GAME_URL, GAME_ROUTE_URL].includes(url.href)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(GAME_URL, response.clone()));
          return response;
        })
        .catch(() => caches.match(GAME_URL)),
    );
  }
});
