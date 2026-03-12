// ===== GéoQuiz Service Worker =====
const CACHE_NAME = 'geoquiz-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Mulish:wght@300;400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap'
];

// Installation — mise en cache des fichiers essentiels
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('GéoQuiz: Cache installé');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation — suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — répondre depuis le cache si pas de connexion
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache les nouvelles ressources
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Hors ligne : retourner la page principale
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
