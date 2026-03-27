// Nombre de la caché
const CACHE_NAME = 'gestor-ventanas-v2';

// Archivos a cachear (todos los que necesitas offline)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalación: guardar todos los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando archivos esenciales');
        return cache.addAll(urlsToCache);
      })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Fetch: servir desde caché primero, luego red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Si está en caché, devolverlo (funciona offline)
          return response;
        }
        // Si no, buscar en red y cachear para próxima vez
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediato
  self.clients.claim();
});
