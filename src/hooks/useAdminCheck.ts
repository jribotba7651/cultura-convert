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
    const checkAdminAccess = async () => {
      if (!user) {
        console.warn('[useAdminCheck] No user session — redirecting to /auth');
        navigate('/auth');
        return;
      }

      try {
        console.info('[useAdminCheck] Verifying admin for', user.email, 'on', window.location.origin);
        const { data, error } = await supabase.functions.invoke('check-admin-access', {
          method: 'POST',
        });

        if (error) {
          console.error('[useAdminCheck] Edge function error:', {
            message: error.message,
            name: error.name,
            context: (error as any)?.context,
            status: (error as any)?.status,
          });
          setIsAdmin(false);
          toast({
            title: 'Error de verificación',
            description: `No se pudo verificar tu acceso: ${error.message}. Revisa la consola.`,
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
      } catch (error) {
        console.error('[useAdminCheck] Unexpected error:', error);
        setIsAdmin(false);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, toast]);

  return { isAdmin, loading };
};
