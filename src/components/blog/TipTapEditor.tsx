import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3, 
  Quote, 
  Link as LinkIcon,
  Unlink,
  ImagePlus,
  FileText,
  Loader2

} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import { ResizableImage } from './ResizableImageExtension';

interface TipTapEditorProps {
  content: string;
  contentJson?: Json | null;
  onChange: (html: string, json: Json) => void;
  placeholder?: string;
  postId?: string | null;
}

export function TipTapEditor({ content, contentJson, onChange, placeholder, postId }: TipTapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      ResizableImage.configure({
        inline: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: (contentJson as object) || content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON() as Json);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && contentJson && typeof contentJson === 'object') {
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = JSON.stringify(contentJson);
      if (currentJson !== newJson) {
        editor.commands.setContent(contentJson as object);
      }
    }
  }, [contentJson, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Solo se permiten imágenes JPEG, PNG, WebP y GIF',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: 'La imagen debe ser menor a 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const folder = postId || 'drafts';
      const filePath = `${folder}/${timestamp}-${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Insert resizable image at cursor position
      editor.chain().focus().setResizableImage({ src: data.publicUrl }).run();

      toast({
        title: 'Imagen subida',
        description: 'La imagen se insertó correctamente',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [editor, postId, toast]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [handleImageUpload]);

  const uploadDocxImage = useCallback(async (base64: string, contentType: string, index: number) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = (contentType?.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const folder = postId || 'drafts';
    const filePath = `${folder}/docx-${Date.now()}-${index}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, new Blob([bytes], { type: contentType || 'image/png' }), {
        contentType: contentType || 'image/png',
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
    return data.publicUrl;
  }, [postId]);

  const handleDocxImport = useCallback(async (file: File) => {
    if (!editor) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast({
        title: 'Formato no soportado',
        description: 'Solo se pueden importar archivos .docx',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const mammoth = await import('mammoth/mammoth.browser');
      const arrayBuffer = await file.arrayBuffer();
      let imageIndex = 0;

      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement(async (image: any) => {
            const base64 = await image.read('base64');
            const src = await uploadDocxImage(base64, image.contentType, imageIndex++);
            return { src };
          }),
        }
      );

      const html = result.value?.trim();
      if (!html) {
        toast({
          title: 'Documento vacío',
          description: 'No se encontró contenido en el archivo',
          variant: 'destructive',
        });
        return;
      }

      editor.commands.setContent(html, { emitUpdate: true } as any);
      onChange(editor.getHTML(), editor.getJSON() as Json);

      toast({
        title: 'Documento importado',
        description: imageIndex > 0
          ? `Contenido cargado con ${imageIndex} imagen(es)`
          : 'Contenido cargado en el editor',
      });
    } catch (error) {
      console.error('Error importing .docx:', error);
      toast({
        title: 'Error',
        description: 'No se pudo importar el documento',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  }, [editor, onChange, toast, uploadDocxImage]);

  const handleDocxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocxImport(file);
    }
    e.target.value = '';
  }, [handleDocxImport]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={docxInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleDocxInputChange}
        className="hidden"
      />

      <div className="flex flex-wrap gap-2 p-3 border-b bg-muted/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('heading', { level: 2 }) && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('heading', { level: 3 }) && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('bold') && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('italic') && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('bulletList') && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('orderedList') && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('blockquote') && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={setLink}
          className={cn(
            'shadow-sm hover:shadow hover:bg-background',
            editor.isActive('link') && 'bg-accent text-accent-foreground ring-1 ring-primary/30 shadow'
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        {editor.isActive('link') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="shadow-sm hover:shadow hover:bg-background"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shadow-sm hover:shadow hover:bg-background"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => docxInputRef.current?.click()}
          disabled={importing}
          title="Importar .docx"
          className="gap-1 shadow-sm hover:shadow hover:bg-background"
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="text-xs">Import .docx</span>
        </Button>

      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
