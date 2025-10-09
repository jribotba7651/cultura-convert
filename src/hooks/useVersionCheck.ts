import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const BUILD_ID_KEY = 'app-build-id';

export const useVersionCheck = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  const getCurrentBuildId = async (): Promise<string | null> => {
    try {
      // Intentar obtener el build ID del manifest
      const response = await fetch('/manifest.json?t=' + Date.now(), {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const manifest = await response.json();
        // El manifest de Vite contiene información sobre los chunks
        return JSON.stringify(manifest);
      }
    } catch (error) {
      console.error('Error fetching manifest:', error);
    }
    
    // Fallback: usar timestamp del index.html
    try {
      const response = await fetch('/?t=' + Date.now(), {
        cache: 'no-store',
      });
      const etag = response.headers.get('etag');
      return etag || response.headers.get('last-modified') || null;
    } catch (error) {
      console.error('Error checking version:', error);
      return null;
    }
  };

  const checkForUpdates = async () => {
    const currentBuildId = await getCurrentBuildId();
    
    if (!currentBuildId) {
      return;
    }

    const storedBuildId = localStorage.getItem(BUILD_ID_KEY);

    if (!storedBuildId) {
      // Primera visita, guardar el build ID actual
      localStorage.setItem(BUILD_ID_KEY, currentBuildId);
      return;
    }

    if (storedBuildId !== currentBuildId) {
      console.log('Nueva versión detectada');
      setUpdateAvailable(true);
      
      toast({
        title: '¡Nueva versión disponible!',
        description: 'Hay una actualización del sitio. Recarga la página para obtener la última versión.',
        duration: 10000,
      });
      
      // Recargar automáticamente después de 10 segundos si el usuario no interactúa
      setTimeout(() => {
        localStorage.setItem(BUILD_ID_KEY, currentBuildId);
        window.location.reload();
      }, 10000);
    }
  };

  useEffect(() => {
    // Verificar al cargar
    checkForUpdates();

    // Verificar periódicamente
    const interval = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);

    // Verificar cuando la pestaña vuelve a estar visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { updateAvailable };
};
