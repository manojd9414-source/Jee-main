// ═══════════════════════════════════════
// JEE99ile — Service Worker v2.0
// Push Notifications + Offline Cache
// ═══════════════════════════════════════

var CACHE_NAME = 'jee99ile-v2';
var OFFLINE_URLS = ['/', '/index.html'];

// ── Install ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(OFFLINE_URLS).catch(function() {});
    })
  );
  self.skipWaiting();
});

// ── Activate ──
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

// ── Fetch (offline fallback) ──
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

// ── Push Notification handler ──
self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err) {}

  var title   = data.title   || '📚 JEE99ile';
  var body    = data.body    || 'Padhai ka time ho gaya bhai! 🔥';
  var icon    = data.icon    || '/icon-192.png';
  var badge   = data.badge   || '/icon-192.png';
  var tag     = data.tag     || 'jee-reminder';
  var url     = data.url     || '/';

  e.waitUntil(
    self.registration.showNotification(title, {
      body    : body,
      icon    : icon,
      badge   : badge,
      tag     : tag,
      data    : { url: url },
      vibrate : [200, 100, 200],
      requireInteraction: false,
      actions : [
        { action: 'open',    title: '📖 Padhai Shuru Karo' },
        { action: 'dismiss', title: '⏰ Baad Mein'          }
      ]
    })
  );
});

// ── Notification click ──
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  if (e.action === 'dismiss') return;

  var targetUrl = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(self.location.origin) && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Background Sync: schedule local reminders ──
// Clients can postMessage to schedule timed notifications
self.addEventListener('message', function(e) {
  if (!e.data) return;

  // Ping-pong to confirm SW is alive
  if (e.data.type === 'PING') {
    e.ports[0] && e.ports[0].postMessage({ type: 'PONG' });
  }
});
