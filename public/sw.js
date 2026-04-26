const CACHE_NAME = "wellfit-mobile-test-v2";
const OFFLINE_URLS = [
  "/mobile",
  "/mobile/missionen",
  "/mobile/missionen/squat",
  "/mobile/buddy",
  "/mobile/analyse",
  "/mobile/bewegung",
  "/mobile/einstellungen",
  "/mobile/ar",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("/mobile")))
  );
});
