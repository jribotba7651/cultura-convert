import { useAdminCheck } from '@/hooks/useAdminCheck';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, FileText, Download, Trash2, Edit, Upload, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ConsultingResource {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  download_count: number;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminResources() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { user } = useAuth();
  const [resources, setResources] = useState<ConsultingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ConsultingResource | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title_es: '',
    title_en: '',
    description_es: '',
    description_en: '',
    display_order: 0,
    is_featured: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchResources();
    }
  }, [isAdmin]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('consulting_resources')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('El archivo debe ser menor a 10MB');
      return;
    }

    // Validar tipo
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !editingResource) {
      toast.error('Debes seleccionar un archivo PDF');
      return;
    }

    setUploading(true);

    try {
      let filePath = editingResource?.file_path || '';
      let fileName = editingResource?.file_name || '';
      let fileSize = editingResource?.file_size_bytes || 0;

      // Si hay un archivo nuevo, subirlo
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        fileName = `${Date.now()}.${fileExt}`;
        filePath = `resources/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('consulting-resources')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;
        fileSize = selectedFile.size;
      }

      // Guardar o actualizar metadatos
      if (editingResource) {
        const { error } = await supabase
          .from('consulting_resources')
          .update({
            ...formData,
            file_path: filePath,
            file_name: fileName,
            file_size_bytes: fileSize,
          })
          .eq('id', editingResource.id);

        if (error) throw error;
        toast.success('Recurso actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('consulting_resources')
          .insert({
            ...formData,
            file_path: filePath,
            file_name: fileName,
            file_size_bytes: fileSize,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Recurso creado exitosamente');
      }

      // Resetear formulario
      setFormData({
        title_es: '',
        title_en: '',
        description_es: '',
        description_en: '',
        display_order: 0,
        is_featured: false,
      });
      setSelectedFile(null);
      setEditingResource(null);
      setIsDialogOpen(false);
      fetchResources();
    } catch (error: any) {
      console.error('Error saving resource:', error);
      toast.error('Error al guardar: ' + (error.message || 'Intenta de nuevo'));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource: ConsultingResource) => {
    setEditingResource(resource);
    setFormData({
      title_es: resource.title_es,
      title_en: resource.title_en,
      description_es: resource.description_es,
      description_en: resource.description_en,
      display_order: resource.display_order,
      is_featured: resource.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (resource: ConsultingResource) => {
    if (!confirm('¿Estás seguro de eliminar este recurso?')) return;

    try {
      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('consulting-resources')
        .remove([resource.file_path]);

      if (storageError) console.error('Error deleting file:', storageError);

      // Eliminar registro de la base de datos
      const { error } = await supabase
        .from('consulting_resources')
        .delete()
        .eq('id', resource.id);

      if (error) throw error;

      toast.success('Recurso eliminado exitosamente');
      fetchResources();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast.error('Error al eliminar: ' + (error.message || 'Intenta de nuevo'));
    }
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('consulting-resources')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestión de Recursos</h1>
            <p className="text-muted-foreground">
              Administra los PDFs y guías descargables para consultoría
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingResource(null);
                  setFormData({
                    title_es: '',
                    title_en: '',
                    description_es: '',
                    description_en: '',
                    display_order: resources.length,
                    is_featured: false,
                  });
                  setSelectedFile(null);
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Recurso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
                </DialogTitle>
                <DialogDescription>
                  {editingResource
                    ? 'Actualiza la información del recurso'
                    : 'Sube un nuevo PDF y completa la información'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="file">Archivo PDF {!editingResource && '*'}</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <Check className="inline h-4 w-4 mr-1" />
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                  {editingResource && !selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Archivo actual: {editingResource.file_name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title_es">Título en Español *</Label>
                  <Input
                    id="title_es"
                    value={formData.title_es}
                    onChange={(e) =>
                      setFormData({ ...formData, title_es: e.target.value })
                    }
                    required
                    placeholder="Guía de Controles de Compras"
                  />
                </div>

                <div>
                  <Label htmlFor="title_en">Título en Inglés *</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    required
                    placeholder="Purchasing Controls Guide"
                  />
                </div>

                <div>
                  <Label htmlFor="description_es">Descripción en Español *</Label>
                  <Textarea
                    id="description_es"
                    value={formData.description_es}
                    onChange={(e) =>
                      setFormData({ ...formData, description_es: e.target.value })
                    }
                    required
                    rows={3}
                    placeholder="Aprende cómo los fabricantes evalúan proveedores..."
                  />
                </div>

                <div>
                  <Label htmlFor="description_en">Descripción en Inglés *</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) =>
                      setFormData({ ...formData, description_en: e.target.value })
                    }
                    required
                    rows={3}
                    placeholder="Learn how manufacturers evaluate suppliers..."
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="display_order">Orden de Visualización</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          setFormData({ ...formData, is_featured: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Destacado</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {editingResource ? 'Actualizar' : 'Crear Recurso'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay recursos aún. Crea el primero.</p>
              </CardContent>
            </Card>
          ) : (
            resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {resource.title_es}
                        </CardTitle>
                        {resource.is_featured && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Destacado
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {resource.title_en}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(resource)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resource)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Descripción ES:</p>
                      <p className="text-sm text-muted-foreground">
                        {resource.description_es}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Descripción EN:</p>
                      <p className="text-sm text-muted-foreground">
                        {resource.description_en}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2 border-t">
                      <span>
                        <FileText className="inline h-4 w-4 mr-1" />
                        {resource.file_name}
                      </span>
                      <span>{formatFileSize(resource.file_size_bytes)}</span>
                      <span>
                        <Download className="inline h-4 w-4 mr-1" />
                        {resource.download_count} descargas
                      </span>
                      <span>Orden: {resource.display_order}</span>
                      <a
                        href={getPublicUrl(resource.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ver PDF
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
}
