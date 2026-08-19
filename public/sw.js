const CACHE = 'offline-app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/app.js',
  '/src/db.js',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.3/dist/dexie.min.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);

  if (url.pathname.startsWith('/api/')) {
    // network-first for API
    evt.respondWith(
      fetch(evt.request).catch(() => new Response(JSON.stringify({ error: 'offline' }), { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // cache-first for app shell
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request).catch(() => caches.match('/index.html')))
  );
});
