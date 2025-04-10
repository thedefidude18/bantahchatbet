// Development environment service worker
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // In development, don't cache anything, just fetch from network
  if (event.request.method !== 'GET' || 
      event.request.headers.get('upgrade') === 'websocket') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(error => {
        console.error('Fetch failed:', error);
        throw error;
      })
  );
});
