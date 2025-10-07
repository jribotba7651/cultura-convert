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
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-admin-access', {
          method: 'POST',
        });

        if (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
          toast({
            title: 'Acceso denegado',
            description: 'No tienes permisos para acceder a esta página',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        if (!data?.isAdmin) {
          setIsAdmin(false);
          toast({
            title: 'Acceso denegado',
            description: 'No tienes permisos de administrador',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error in admin check:', error);
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
