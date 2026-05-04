// APEX Career Intelligence — Service Worker v2
const CACHE_NAME = 'apex-v2';

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        './APEXUnified.html',
      ]).catch(function() { /* ok if offline */ });
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Never intercept API calls
  var url = event.request.url;
  if (url.includes('anthropic.com') ||
      url.includes('api.github.com') ||
      url.includes('emailjs.com') ||
      url.includes('googleapis.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response.ok && event.request.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
