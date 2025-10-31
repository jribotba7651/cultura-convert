import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker deshabilitado temporalmente para evitar problemas de caché
// Limpiar cualquier SW existente y sus cachés
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Limpieza temprana (antes de que cargue todo) para evitar bundles mezclados
  (async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[SW] Service Worker desregistrado (early)');
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('[SW] Caché eliminada (early):', cacheName);
        }
      }

      console.log('[SW] Limpieza temprana completa - evitando archivos en caché antiguos');
    } catch (error) {
      console.log('[SW] Error en limpieza temprana:', error);
    }
  })();

  // Fallback en load por si algún SW aún controlaba la página inicial
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[SW] Service Worker desregistrado');
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('[SW] Caché eliminada:', cacheName);
        }
      }
      
      console.log('[SW] Limpieza completa - app usará siempre recursos frescos');
    } catch (error) {
      console.log('[SW] Error al limpiar Service Worker:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
