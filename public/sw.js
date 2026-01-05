// Service Worker para gestión de caché y detección de actualizaciones
const CACHE_VERSION = 'v4';
const CACHE_NAME = `escritores-pr-${CACHE_VERSION}`;

// Instalar el service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3...');
  self.skipWaiting(); // Activar inmediatamente
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v3...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguos
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todas las páginas inmediatamente
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // HTML y navegaciones: network-first con no-store
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || Response.error();
        })
    );
    return;
  }

  // JS/CSS/estáticos: network-first con fallback a caché
  const isStatic = /\.(js|css|json|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot)$/.test(url.pathname);
  if (isStatic) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request, { cache: 'no-store' });
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Último intento sin no-store
        return fetch(request);
      }
    })());
  }
});

// Notificar a los clientes sobre actualizaciones
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
