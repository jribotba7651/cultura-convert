import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut, BarChart3, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = React.useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('signedOut'),
        description: t('signedOutSuccess'),
      });
    }
  };

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          {t('signIn')}
        </Button>
      </Link>
    );
  }

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase.functions.invoke('check-admin-access');
        setIsAdmin(data?.isAdmin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user.email}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {t('myAccount')}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/mis-pedidos" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t('myOrders')}</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/blog" className="flex items-center cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>Gestionar Blog</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/orders" className="flex items-center cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>Gestionar Pedidos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/analytics" className="flex items-center cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Dashboard Analytics</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;