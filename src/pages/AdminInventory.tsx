import { useEffect, useState } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryRow {
  id: string;
  title: { es?: string; en?: string } | null;
  price_cents: number;
  stock_count: number | null;
  printify_product_id: string | null;
}

export default function AdminInventory() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncFromPrintify = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-printify-products');
      if (error) throw error;
      const result = data as { synced?: number; created?: number; updated?: number; message?: string } | null;
      toast.success(
        result?.message ||
          `Sincronización completa: ${result?.created ?? 0} nuevos, ${result?.updated ?? 0} actualizados`
      );
      await fetchRows();
    } catch (err) {
      console.error('Error syncing from Printify:', err);
      toast.error('No se pudo sincronizar con Printify. Revisa los logs del edge function.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchRows();
  }, [isAdmin]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products_public')
      .select('id, title, price_cents, stock_count, printify_product_id')
      .order('price_cents', { ascending: false });

    if (error) {
      console.error('Error loading inventory:', error);
      toast.error('Error al cargar el inventario');
      setLoading(false);
      return;
    }

    const list = (data || []) as unknown as InventoryRow[];
    setRows(list);
    setDrafts(
      Object.fromEntries(
        list.map((r) => [r.id, r.stock_count === null ? '' : String(r.stock_count)])
      )
    );
    setLoading(false);
  };

  const saveRow = async (row: InventoryRow) => {
    const raw = (drafts[row.id] ?? '').trim();
    let value: number | null = null;

    if (raw !== '') {
      const parsed = Number(raw);
      if (!Number.isInteger(parsed) || parsed < 0) {
        toast.error('Introduce un número entero de 0 o más, o deja el campo vacío para no rastrear.');
        return;
      }
      value = parsed;
    }

    setSavingId(row.id);
    const { error } = await supabase
      .from('products')
      .update({ stock_count: value })
      .eq('id', row.id);
    setSavingId(null);

    if (error) {
      console.error('Error saving stock_count:', error);
      toast.error(`No se pudo guardar: ${error.message}`);
      return;
    }

    setRows((current) =>
      current.map((r) => (r.id === row.id ? { ...r, stock_count: value } : r))
    );
    toast.success('Inventario actualizado');
  };

  const titleOf = (row: InventoryRow) =>
    row.title?.es || row.title?.en || row.id;

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <Package className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
          </div>
          <Button onClick={syncFromPrintify} disabled={syncing} variant="outline">
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sincronizar desde Printify
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">
          Edita el inventario manual de cada producto. Un campo vacío significa{' '}
          <strong>sin rastreo</strong>: el flujo de compra no cambia y no se valida
          existencia. Este campo es solo informativo por ahora.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <Card key={row.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base leading-snug">
                        {titleOf(row)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        ${(row.price_cents / 100).toFixed(2)} · {row.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    <Badge variant={row.printify_product_id ? 'secondary' : 'outline'}>
                      {row.printify_product_id ? 'Printify' : 'Envío manual'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 max-w-[200px]">
                      <label
                        className="text-xs text-muted-foreground"
                        htmlFor={`stock-${row.id}`}
                      >
                        Existencias (vacío = sin rastreo)
                      </label>
                      <Input
                        id={`stock-${row.id}`}
                        type="number"
                        min={0}
                        step={1}
                        placeholder="sin rastreo"
                        value={drafts[row.id] ?? ''}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                        }
                      />
                    </div>
                    <Button
                      onClick={() => saveRow(row)}
                      disabled={savingId === row.id}
                      variant="outline"
                    >
                      {savingId === row.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}