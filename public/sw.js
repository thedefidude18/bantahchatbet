const CACHE_NAME = 'bantah-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Add image domains to whitelist
const ALLOWED_IMAGE_DOMAINS = [
  'images.unsplash.com',
  self.location.origin
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Service Worker
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

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
  // Check if the request is for an image from allowed domains
  const url = new URL(event.request.url);
  const isAllowedImageDomain = ALLOWED_IMAGE_DOMAINS.some(domain => url.hostname === domain);

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((fetchResponse) => {
        // Don't cache if:
        // 1. It's an API call
        // 2. It's not from allowed domains
        // 3. Response is not ok
        if (
          event.request.url.includes('/api/') ||
          (!isAllowedImageDomain && !event.request.url.startsWith(self.location.origin)) ||
          !fetchResponse.ok
        ) {
          return fetchResponse;
        }

        // Clone the response since we need to return it and also store it in the cache
        const responseToCache = fetchResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      }).catch((error) => {
        console.error('Fetch failed:', error);
        // Return a fallback response or rethrow the error
        throw error;
      });
    })
  );
});
