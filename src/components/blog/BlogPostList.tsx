import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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

interface BlogPost {
  id: string;
  title_en: string;
  title_es: string;
  excerpt_en: string;
  excerpt_es: string;
  published: boolean;
  featured: boolean;
  category_en: string;
  category_es: string;
  date: string;
  slug: string;
}

interface BlogPostListProps {
  onEdit: (postId: string) => void;
}

export function BlogPostList({ onEdit }: BlogPostListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {language === 'es' ? post.category_es : post.category_en}
                    </Badge>
                    {post.published ? (
                      <Badge variant="default">
                        <Eye className="mr-1 h-3 w-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    {post.featured && <Badge variant="default">Featured</Badge>}
                  </div>
                  <CardTitle className="text-xl mb-1">
                    {language === 'es' ? post.title_es : post.title_en}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString()} • /{post.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(post.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteId(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">
                {language === 'es' ? post.excerpt_es : post.excerpt_en}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
