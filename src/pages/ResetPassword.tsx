import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const es = language === 'es';

  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: es ? 'Contraseña muy corta' : 'Password too short',
        description: es ? 'Usa al menos 8 caracteres.' : 'Use at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: es ? 'Las contraseñas no coinciden' : 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: es ? 'Error' : 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: es ? 'Contraseña actualizada' : 'Password updated',
      description: es ? 'Ya puedes usar tu nueva contraseña.' : 'You can now use your new password.',
    });
    setPassword('');
    setConfirm('');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{es ? 'Cambiar contraseña' : 'Change password'} | Jíbaro en la Luna</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navigation />

      <main className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{es ? 'Cambiar contraseña' : 'Change password'}</CardTitle>
            <CardDescription>
              {es
                ? 'Escribe tu nueva contraseña dos veces para confirmarla.'
                : 'Enter your new password twice to confirm it.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSession === false ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {es
                    ? 'Necesitas iniciar sesión (o abrir el enlace de recuperación de tu email) para cambiar la contraseña.'
                    : 'You need to sign in (or open the recovery link from your email) to change your password.'}
                </p>
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  {es ? 'Iniciar sesión' : 'Sign in'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{es ? 'Nueva contraseña' : 'New password'}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{es ? 'Confirmar contraseña' : 'Confirm password'}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? es ? 'Guardando...' : 'Saving...'
                    : es ? 'Actualizar contraseña' : 'Update password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResetPassword;
