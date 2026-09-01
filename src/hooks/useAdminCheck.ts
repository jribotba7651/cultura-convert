import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 500;
    let cancelled = false;

    const checkAdminAccess = async () => {
      if (!user) {
        console.warn('[useAdminCheck] No user session — redirecting to /auth');
        navigate('/auth');
        return;
      }

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.info(
            `[useAdminCheck] Verifying admin for ${user.email} on ${window.location.origin} (attempt ${attempt}/${MAX_RETRIES})`
          );
          const { data, error } = await supabase.functions.invoke('check-admin-access', {
            method: 'POST',
          });

          if (cancelled) return;

          if (error) {
            console.warn('[useAdminCheck] Edge function error:', {
              attempt,
              message: error.message,
              name: error.name,
              context: (error as any)?.context,
              status: (error as any)?.status,
            });
            if (attempt < MAX_RETRIES) {
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
              continue;
            }
            setIsAdmin(false);
            setLoading(false);
            toast({
              title: 'Error de verificación',
              description: 'No pudimos confirmar tu acceso de administrador. Por favor, intenta de nuevo.',
              variant: 'destructive',
            });
            navigate('/');
            return;
          }

          if (!data?.isAdmin) {
            console.warn('[useAdminCheck] User is not admin:', data);
            setIsAdmin(false);
            toast({
              title: 'Acceso denegado',
              description: `${user.email} no tiene rol de administrador.`,
              variant: 'destructive',
            });
            navigate('/');
            return;
          }

          console.info('[useAdminCheck] Admin access granted');
          setIsAdmin(true);
          setLoading(false);
          return;
        } catch (error) {
          if (cancelled) return;
          console.warn('[useAdminCheck] Unexpected error on attempt', attempt, ':', error);
          if (attempt < MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            continue;
          }
          setIsAdmin(false);
          setLoading(false);
          toast({
            title: 'Error de verificación',
            description: 'Ocurrió un error inesperado al confirmar tu acceso. Por favor, intenta de nuevo.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
      }
    };

    checkAdminAccess();
    return () => {
      cancelled = true;
    };
  }, [user, navigate, toast]);

  return { isAdmin, loading };
};
