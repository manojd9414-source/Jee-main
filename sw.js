// ═══════════════════════════════════════
// JEE99ile — Service Worker v3.0
// Full Offline Support + Push Notifications
// ═══════════════════════════════════════

var CACHE_NAME = 'jee99ile-v3';
var OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ── Install: Cache everything ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(OFFLINE_URLS).catch(function(err) {
        console.warn('Cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: Clean old caches ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: Cache first, then network ──
self.addEventListener('fetch', function(e) {
  // Skip non-GET and Firebase/Google requests (unhe cache mat karo)
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  if (url.includes('firestore.googleapis.com') ||
      url.includes('firebase') ||
      url.includes('googleapis.com') ||
      url.includes('gstatic.com')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      // Cache mein hai toh seedha do
      if (cached) return cached;

      // Nahi hai toh network se lo aur cache mein save karo
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200) return response;
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        // Network bhi nahi — index.html do (offline fallback)
        return caches.match('/index.html');
      });
    })
  );
});

// ── Push Notification ──
self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err) {}
  var title = data.title || '📚 JEE99ile';
  var body  = data.body  || 'Padhai ka time ho gaya bhai! 🔥';
  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'jee-reminder',
      vibrate: [200, 100, 200],
      requireInteraction: false
    })
  );
});

// ── Notification click ──
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
