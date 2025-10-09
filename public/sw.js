// Service Worker para gestión de caché y detección de actualizaciones
const CACHE_VERSION = 'v1';
const CACHE_NAME = `escritores-pr-${CACHE_VERSION}`;

// Instalar el service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting(); // Activar inmediatamente
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
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

  // Estrategia: Network first para HTML, Cache first para assets
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    // Network first para navegación
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar y cachear la respuesta
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback a caché si no hay red
          return caches.match(request);
        })
    );
  } else {
    // Cache first para assets estáticos
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Si está en caché, devolverlo pero actualizar en background
          fetch(request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }).catch(() => {});
          
          return cachedResponse;
        }

        // Si no está en caché, obtener de la red
        return fetch(request).then((response) => {
          // Cachear para próxima vez
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Notificar a los clientes sobre actualizaciones
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
