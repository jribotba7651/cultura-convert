import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface TrafficSource {
  source: string;
  views: number;
  visitors: number;
}

interface TrafficSourcesPanelProps {
  sources: TrafficSource[];
  sourcesBooks: TrafficSource[];
  devPageViews: number;
  internalPageViews: number;
}

const INTERNAL_SOURCE = 'Interno (navegación)';

const SourceTable = ({ rows }: { rows: TrafficSource[] }) => {
  if (rows.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-6">
        No hay datos de fuentes en este período
      </p>
    );
  }

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="source" interval={0} tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="visitors" fill="hsl(var(--primary))" name="Visitas" />
          <Bar dataKey="views" fill="hsl(var(--secondary))" name="Páginas vistas" />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Fuente</th>
              <th className="text-right py-3 px-4">Visitas</th>
              <th className="text-right py-3 px-4">Páginas vistas</th>
              <th className="text-right py-3 px-4">% del tráfico</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 15).map((row) => (
              <tr key={row.source} className="border-b">
                <td className="py-3 px-4 font-medium">{row.source}</td>
                <td className="text-right py-3 px-4">{row.visitors}</td>
                <td className="text-right py-3 px-4">{row.views}</td>
                <td className="text-right py-3 px-4">
                  {totalViews > 0 ? ((row.views / totalViews) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TrafficSourcesPanel = ({
  sources,
  sourcesBooks,
  devPageViews,
  internalPageViews,
}: TrafficSourcesPanelProps) => {
  const [realUsersOnly, setRealUsersOnly] = useState(true);

  const filter = (rows: TrafficSource[]) =>
    realUsersOnly ? rows.filter((r) => r.source !== INTERNAL_SOURCE) : rows;

  const excludedNote = realUsersOnly
    ? devPageViews + internalPageViews
    : devPageViews;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div>
          <CardTitle>Fuentes de Tráfico</CardTitle>
          <CardDescription>
            De dónde llegan los visitantes (referrer normalizado)
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            id="real-users"
            checked={realUsersOnly}
            onCheckedChange={setRealUsersOnly}
          />
          <Label htmlFor="real-users" className="text-sm">Tráfico real</Label>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todo el sitio</TabsTrigger>
            <TabsTrigger value="books">Solo páginas de libros</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <SourceTable rows={filter(sources)} />
          </TabsContent>
          <TabsContent value="books">
            <SourceTable rows={filter(sourcesBooks)} />
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground mt-6">
          Excluyendo {excludedNote} páginas vistas internas/dev
          {realUsersOnly
            ? ' (Lovable + navegación interna)'
            : ' (solo Lovable/dev)'}
          .
        </p>
      </CardContent>
    </Card>
  );
};

export default TrafficSourcesPanel;
