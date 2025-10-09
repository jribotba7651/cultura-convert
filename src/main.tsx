import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker deshabilitado temporalmente para evitar problemas de caché
// Limpiar cualquier SW existente y sus cachés
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      // Desregistrar todos los service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[SW] Service Worker desregistrado');
      }
      
      // Limpiar todas las cachés
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('[SW] Caché eliminada:', cacheName);
      }
      
      console.log('[SW] Limpieza completa - app usará siempre recursos frescos');
    } catch (error) {
      console.log('[SW] Error al limpiar Service Worker:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
