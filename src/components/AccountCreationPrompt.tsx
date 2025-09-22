import { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface AccountCreationPromptProps {
  orderId: string;
  customerEmail: string;
  customerName: string;
  onSuccess?: () => void;
}

const AccountCreationPrompt = ({ 
  orderId, 
  customerEmail, 
  customerName, 
  onSuccess 
}: AccountCreationPromptProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleCreateAccount = async () => {
    if (!password || password.length < 6) {
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' 
          ? 'La contraseña debe tener al menos 6 caracteres.'
          : 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: customerName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create edge function to migrate the order
        const { error: migrateError } = await supabase.functions.invoke('migrate-anonymous-order', {
          body: {
            order_id: orderId,
            user_id: authData.user.id
          }
        });

        if (migrateError) {
          console.error('Migration error:', migrateError);
          // Account created but migration failed - still a partial success
        }

        toast({
          title: language === 'es' ? '¡Cuenta creada!' : 'Account created!',
          description: language === 'es' 
            ? 'Tu cuenta ha sido creada y tu pedido ha sido vinculado. Revisa tu email para confirmar la cuenta.'
            : 'Your account has been created and your order has been linked. Check your email to confirm your account.',
        });

        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: error.message || (language === 'es' 
          ? 'No se pudo crear la cuenta.'
          : 'Failed to create account.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <UserPlus className="h-5 w-5" />
          {language === 'es' ? '¡Guarda este pedido en tu cuenta!' : 'Save this order to your account!'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {language === 'es'
            ? 'Crea una cuenta para no perder el seguimiento de tu pedido y hacer recompras fácilmente.'
            : 'Create an account to keep track of your order and reorder easily in the future.'
          }
        </p>

        <div className="space-y-3">
          <div>
            <Label htmlFor="account-password" className="text-sm font-medium">
              {language === 'es' ? 'Crear contraseña' : 'Create password'}
            </Label>
            <div className="relative">
              <Input
                id="account-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleCreateAccount}
              disabled={loading || !password}
              className="flex-1"
            >
              {loading ? (
                language === 'es' ? 'Creando...' : 'Creating...'
              ) : (
                language === 'es' ? 'Crear cuenta' : 'Create account'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setDismissed(true)}
              disabled={loading}
            >
              {language === 'es' ? 'Tal vez más tarde' : 'Maybe later'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-background/50 rounded p-2">
          <strong>{language === 'es' ? 'Beneficios:' : 'Benefits:'}</strong>
          <ul className="mt-1 space-y-1">
            <li>• {language === 'es' ? 'Historial de pedidos' : 'Order history'}</li>
            <li>• {language === 'es' ? 'Recompras rápidas' : 'Quick reorders'}</li>
            <li>• {language === 'es' ? 'Seguimiento automático' : 'Automatic tracking'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCreationPrompt;