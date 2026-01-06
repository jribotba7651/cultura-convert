import { useAdminCheck } from '@/hooks/useAdminCheck';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MigrationResult {
  index: number;
  title?: string;
  url?: string;
  success: boolean;
  skipped?: boolean;
  imagesCount?: number;
  error?: string;
}

export default function AdminBlogMigration() {
  const { isAdmin, loading } = useAdminCheck();
  const { toast } = useToast();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [currentPost, setCurrentPost] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleMigration = async () => {
    setMigrating(true);
    setResults([]);
    setProgress(0);
    
    try {
      // First get the list of posts
      const { data: listData, error: listError } = await supabase.functions.invoke('migrate-blogspot', {
        body: { action: 'list' }
      });
      
      if (listError || !listData?.posts) {
        throw new Error(listError?.message || 'Failed to get post list');
      }
      
      const posts = listData.posts;
      setTotalPosts(posts.length);
      
      // Migrate one by one to show progress
      for (let i = 0; i < posts.length; i++) {
        setCurrentPost(posts[i].url);
        setProgress(((i) / posts.length) * 100);
        
        try {
          const { data, error } = await supabase.functions.invoke('migrate-blogspot', {
            body: { action: 'migrate-single', postIndex: i }
          });
          
          if (error) {
            setResults(prev => [...prev, { 
              index: i, 
              url: posts[i].url, 
              success: false, 
              error: error.message 
            }]);
          } else if (data.skipped) {
            setResults(prev => [...prev, { 
              index: i, 
              title: data.title, 
              success: true, 
              skipped: true 
            }]);
          } else {
            setResults(prev => [...prev, { 
              index: i, 
              title: data.post?.title, 
              success: true, 
              imagesCount: data.post?.imagesCount 
            }]);
          }
        } catch (err) {
          setResults(prev => [...prev, { 
            index: i, 
            url: posts[i].url, 
            success: false, 
            error: String(err) 
          }]);
        }
      }
      
      setProgress(100);
      setCurrentPost(null);
      
      const successCount = results.filter(r => r.success && !r.skipped).length;
      toast({
        title: 'Migración completada',
        description: `Se migraron ${successCount} posts exitosamente.`
      });
      
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setMigrating(false);
    }
  };

  const successCount = results.filter(r => r.success && !r.skipped).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Migración de Blog desde Blogspot</CardTitle>
              <CardDescription>
                Importa todos los posts de jibaroenlaluna.blogspot.com a Supabase, incluyendo las imágenes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!migrating && results.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">
                    Esta herramienta extraerá automáticamente todos los posts del Blogspot original,
                    descargará las imágenes y las subirá a Supabase Storage.
                  </p>
                  <Button onClick={handleMigration} size="lg">
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Migración
                  </Button>
                </div>
              )}
              
              {migrating && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Migrando posts...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {currentPost && `Procesando: ${currentPost.split('/').pop()}`}
                  </p>
                  <p className="text-sm">
                    {results.length} de {totalPosts} posts procesados
                  </p>
                </div>
              )}
              
              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{successCount} migrados</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{skippedCount} ya existentes</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{errorCount} errores</span>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {results.map((result, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2 p-2 rounded text-sm ${
                          result.success 
                            ? result.skipped 
                              ? 'bg-yellow-50 text-yellow-800'
                              : 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {result.success ? (
                          result.skipped ? (
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )
                        ) : (
                          <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{result.title || result.url}</p>
                          {result.skipped && <p className="text-xs">Ya existe en la base de datos</p>}
                          {result.imagesCount !== undefined && (
                            <p className="text-xs">{result.imagesCount} imágenes subidas</p>
                          )}
                          {result.error && <p className="text-xs">{result.error}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!migrating && (
                    <Button onClick={handleMigration} variant="outline">
                      <Play className="mr-2 h-4 w-4" />
                      Ejecutar de nuevo
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
