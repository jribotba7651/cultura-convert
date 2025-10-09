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
        
        // Verificar actualizaciones periódicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Cada minuto
      })
      .catch((error) => {
        console.log('[SW] Error al registrar Service Worker:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
