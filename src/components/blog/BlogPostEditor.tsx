import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Upload } from 'lucide-react';

interface BlogPostEditorProps {
  postId: string | null;
  onClose: () => void;
}

export function BlogPostEditor({ postId, onClose }: BlogPostEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title_en: '',
    title_es: '',
    excerpt_en: '',
    excerpt_es: '',
    content_en: '',
    content_es: '',
    category_en: '',
    category_es: '',
    slug: '',
    tags: '',
    published: false,
    featured: false,
  });

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title_en: data.title_en || '',
          title_es: data.title_es || '',
          excerpt_en: data.excerpt_en || '',
          excerpt_es: data.excerpt_es || '',
          content_en: data.content_en || '',
          content_es: data.content_es || '',
          category_en: data.category_en || '',
          category_es: data.category_es || '',
          slug: data.slug || '',
          tags: data.tags?.join(', ') || '',
          published: data.published || false,
          featured: data.featured || false,
        });
        setCoverImageUrl(data.cover_image || '');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImage) return coverImageUrl || null;

    try {
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, coverImage);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload cover image',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleSave = async () => {
    if (!formData.title_en || !formData.title_es || !formData.slug) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (titles and slug)',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const uploadedImageUrl = await uploadCoverImage();

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const postData = {
        title_en: formData.title_en,
        title_es: formData.title_es,
        excerpt_en: formData.excerpt_en,
        excerpt_es: formData.excerpt_es,
        content_en: formData.content_en,
        content_es: formData.content_es,
        category_en: formData.category_en,
        category_es: formData.category_es,
        slug: formData.slug,
        tags,
        published: formData.published,
        featured: formData.featured,
        cover_image: uploadedImageUrl,
        date: new Date().toISOString(),
      };

      if (postId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: postId ? 'Post updated successfully' : 'Post created successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{postId ? 'Edit Post' : 'Create New Post'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="es">Español</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-en">Title (English) *</Label>
              <Input
                id="title-en"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Enter title in English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt-en">Excerpt (English)</Label>
              <Textarea
                id="excerpt-en"
                value={formData.excerpt_en}
                onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                placeholder="Brief description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-en">Content (English)</Label>
              <Textarea
                id="content-en"
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                placeholder="Full post content"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-en">Category (English)</Label>
              <Input
                id="category-en"
                value={formData.category_en}
                onChange={(e) => setFormData({ ...formData, category_en: e.target.value })}
                placeholder="e.g., Literature"
              />
            </div>
          </TabsContent>

          <TabsContent value="es" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title-es">Título (Español) *</Label>
              <Input
                id="title-es"
                value={formData.title_es}
                onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                placeholder="Ingresa el título en español"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt-es">Extracto (Español)</Label>
              <Textarea
                id="excerpt-es"
                value={formData.excerpt_es}
                onChange={(e) => setFormData({ ...formData, excerpt_es: e.target.value })}
                placeholder="Breve descripción"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-es">Contenido (Español)</Label>
              <Textarea
                id="content-es"
                value={formData.content_es}
                onChange={(e) => setFormData({ ...formData, content_es: e.target.value })}
                placeholder="Contenido completo del post"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-es">Categoría (Español)</Label>
              <Input
                id="category-es"
                value={formData.category_es}
                onChange={(e) => setFormData({ ...formData, category_es: e.target.value })}
                placeholder="ej., Literatura"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-friendly-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="h-16 w-16 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {postId ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
