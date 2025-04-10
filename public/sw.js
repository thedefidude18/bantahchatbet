const CACHE_NAME = 'bantah-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Image domains allowed for caching
const ALLOWED_IMAGE_DOMAINS = [
  'images.unsplash.com',
  self.location.origin
];

// Install Service Worker and pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch Handler
self.addEventListener('fetch', (event) => {
  // Skip non-GET and WebSocket upgrade requests
  if (
    event.request.method !== 'GET' ||
    event.request.headers.get('upgrade') === 'websocket'
  ) {
    return;
  }

  const url = new URL(event.request.url);
  const isAllowedImageDomain = ALLOWED_IMAGE_DOMAINS.some(domain => url.hostname === domain);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve from cache if available
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Skip caching if:
        // 1. It's an API call
        // 2. The domain isn't allowed
        // 3. Response isn't OK
        if (
          event.request.url.includes('/api/') ||
          (!isAllowedImageDomain && !event.request.url.startsWith(self.location.origin)) ||
          !networkResponse.ok
        ) {
          return networkResponse;
        }

        // Cache a copy of the response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((error) => {
        console.error('Fetch failed:', error);
        throw error;
      });
    })
  );
});
