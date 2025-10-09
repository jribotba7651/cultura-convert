import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Registrar Service Worker para mejor gestión de caché
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker registrado:', registration);
        
        // Detectar cuando hay un nuevo SW disponible
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay un nuevo SW listo, pedirle que tome control
              console.log('[SW] Nuevo Service Worker detectado, activando...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        };
        
        // Cuando el nuevo SW toma control, recargar para usar recursos frescos
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Nuevo Service Worker tomó control, recargando...');
          window.location.reload();
        });
        
        // Verificar actualizaciones periódicamente (cada 5 minutos)
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      })
      .catch((error) => {
        console.log('[SW] Error al registrar Service Worker:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
