import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Download, Loader2, Mail, Trash2, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NewsletterSubscription {
  id: string;
  email: string;
  name: string;
  interests: string[];
  language: string;
  subscribed_at: string;
  is_active: boolean;
  unsubscribed_at: string | null;
}

const AdminNewsletter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminCheckLoading } = useAdminCheck();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminCheckLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminCheckLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSubscriptions();
    }
  }, [isAdmin]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las suscripciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Suscriptor dado de baja',
        description: 'El suscriptor ha sido marcado como inactivo',
      });

      fetchSubscriptions();
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'No se pudo dar de baja al suscriptor',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Suscriptor eliminado',
        description: 'El suscriptor ha sido eliminado permanentemente',
      });

      setDeleteId(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar al suscriptor',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Nombre', 'Intereses', 'Idioma', 'Fecha de Suscripción', 'Estado'];
    const rows = subscriptions.map(sub => [
      sub.email,
      sub.name,
      sub.interests.join('; '),
      sub.language,
      new Date(sub.subscribed_at).toLocaleDateString(),
      sub.is_active ? 'Activo' : 'Inactivo',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (adminCheckLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const activeCount = subscriptions.filter(s => s.is_active).length;
  const inactiveCount = subscriptions.filter(s => !s.is_active).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Gestión de Newsletter</h1>
            <p className="text-muted-foreground">
              {activeCount} suscriptores activos • {inactiveCount} inactivos
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Suscriptores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{subscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{activeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suscriptores</CardTitle>
            <CardDescription>
              Lista de todos los suscriptores al newsletter
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay suscriptores aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Intereses</TableHead>
                      <TableHead>Idioma</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">{subscription.email}</TableCell>
                        <TableCell>{subscription.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subscription.interests.slice(0, 2).map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {subscription.interests.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{subscription.interests.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {subscription.language.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.subscribed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {subscription.is_active ? (
                            <Badge variant="default">Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {subscription.is_active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnsubscribe(subscription.id)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(subscription.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscriptor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El suscriptor será eliminado permanentemente de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNewsletter;
