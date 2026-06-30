const CACHE_NAME = "andres-burger-cache-v2";

const STATIC_ASSETS = [
  "/",
  "/menu",
  "/offline",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/maskable-icon.svg",
  "/icons/apple-touch-icon.svg",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => undefined);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /*
    No cacheamos llamadas externas al backend.
    El backend y admin deben mantenerse frescos.
  */
  if (url.origin !== self.location.origin) {
    return;
  }

  /*
    No cachear panel administrativo.
  */
  if (url.pathname.startsWith("/admin")) {
    return;
  }

  /*
    Assets de Next.js: rápido con stale-while-revalidate.
  */
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  /*
    Navegación pública:
    intenta red primero, si falla usa cache.
  */
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirstNavigation(request) {
  try {
    const networkResponse = await fetch(request);

    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());

    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return caches.match("/offline");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}
