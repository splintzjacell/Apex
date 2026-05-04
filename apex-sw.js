// APEX Career Intelligence — Service Worker
// Provides offline access and caching
const CACHE_NAME = 'apex-v1';
const OFFLINE_URL = self.location.href.replace('apex-sw.js', 'APEXUnified.html');

// Cache the main app file on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        OFFLINE_URL,
        'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
        'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap',
      ]).catch(() => {/* non-critical failures ok */});
    })
  );
  self.skipWaiting();
});

// Serve from cache when offline
self.addEventListener('fetch', event => {
  // Don't intercept API calls
  if (event.request.url.includes('anthropic.com') ||
      event.request.url.includes('api.github.com') ||
      event.request.url.includes('emailjs.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Clean old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
