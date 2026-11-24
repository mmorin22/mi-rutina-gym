const CACHE_NAME = 'ironpulse-pwa-v1';
const IMAGE_CACHE_NAME = 'ironpulse-images-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== IMAGE_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache-first para imágenes de ejercicios de GitHub (free-exercise-db)
  if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResp = await fetch(request);
          if (networkResp && networkResp.ok) {
            cache.put(request, networkResp.clone());
          }
          return networkResp;
        } catch {
          return Response.error();
        }
      })
    );
    return;
  }

  // Estrategia Stale-While-Revalidate para assets locales (JS, CSS, HTML)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match('/index.html'));

        return cachedResponse || fetchPromise;
      })
    );
  }
});
