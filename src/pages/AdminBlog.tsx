import { useAdminCheck } from '@/hooks/useAdminCheck';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BlogPostList } from '@/components/blog/BlogPostList';
import { BlogPostEditor } from '@/components/blog/BlogPostEditor';

export default function AdminBlog() {
  const { isAdmin, loading } = useAdminCheck();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEdit = (postId: string) => {
    setEditingPostId(postId);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingPostId(null);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditingPostId(null);
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage your blog posts</p>
          </div>
          {!isEditing && (
            <Button onClick={handleCreate} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Post
            </Button>
          )}
        </div>

        {isEditing ? (
          <BlogPostEditor postId={editingPostId} onClose={handleClose} />
        ) : (
          <BlogPostList onEdit={handleEdit} />
        )}
      </main>
    </>
  );
}
