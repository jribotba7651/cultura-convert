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
  FileType2,
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
  const [importingPdf, setImportingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
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

  const uploadEditorBlob = useCallback(async (blob: Blob, prefix: string, index: number) => {
    const ext = (blob.type?.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const folder = postId || 'drafts';
    const filePath = `${folder}/${prefix}-${Date.now()}-${index}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, blob, { contentType: blob.type || 'image/png' });

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

  const handlePdfImport = useCallback(async (file: File) => {
    if (!editor) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Formato no soportado',
        description: 'Solo se pueden importar archivos .pdf',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El PDF debe ser menor a 20MB',
        variant: 'destructive',
      });
      return;
    }

    setImportingPdf(true);
    try {
      const pdfjs: any = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      const htmlParts: string[] = [];
      let imageCount = 0;
      let textFound = false;

      const escapeHtml = (value: string) =>
        value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // --- Text: group items into lines by vertical position ---
        const textContent = await page.getTextContent();
        type Line = { y: number; size: number; text: string };
        const lines: Line[] = [];

        for (const item of textContent.items as any[]) {
          if (typeof item.str !== 'string') continue;
          const y = Math.round(item.transform?.[5] ?? 0);
          const size = Math.abs(item.transform?.[3] ?? item.height ?? 12);
          const last = lines[lines.length - 1];
          if (last && Math.abs(last.y - y) <= 2) {
            last.text += item.str;
            last.size = Math.max(last.size, size);
          } else {
            lines.push({ y, size, text: item.str });
          }
        }

        const cleaned = lines
          .map((l) => ({ ...l, text: l.text.replace(/\s+/g, ' ').trim() }))
          .filter((l) => l.text.length > 0);

        const sizes = cleaned.map((l) => l.size);
        const bodySize = sizes.length
          ? sizes.slice().sort((a, b) => a - b)[Math.floor(sizes.length / 2)]
          : 12;

        let paragraph: string[] = [];
        const flush = () => {
          if (paragraph.length) {
            htmlParts.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`);
            paragraph = [];
          }
        };

        cleaned.forEach((line, i) => {
          textFound = true;
          const prev = cleaned[i - 1];
          // Large vertical gap between lines => new paragraph
          if (prev && prev.y - line.y > bodySize * 1.8) flush();

          const isHeading = line.size > bodySize * 1.25 && line.text.length < 120;
          if (isHeading) {
            flush();
            htmlParts.push(`<h2>${escapeHtml(line.text)}</h2>`);
            return;
          }
          paragraph.push(line.text);
          // A short line that does not continue into the next one ends the paragraph
          const next = cleaned[i + 1];
          if (!next || /[.!?:;»"”]$/.test(line.text)) {
            const nextIsFarther = next ? line.y - next.y > bodySize * 1.8 : true;
            if (nextIsFarther) flush();
          }
        });
        flush();


        // --- Embedded images (best effort) ---
        try {
          const ops = await page.getOperatorList();
          const imageNames: string[] = [];
          for (let i = 0; i < ops.fnArray.length; i++) {
            if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) {
              const name = ops.argsArray[i]?.[0];
              if (typeof name === 'string' && !imageNames.includes(name)) imageNames.push(name);
            }
          }

          for (const name of imageNames) {
            const img: any = await new Promise((resolve) => {
              try {
                page.objs.get(name, resolve);
              } catch {
                resolve(null);
              }
            });
            if (!img) continue;

            const width = img.width;
            const height = img.height;
            if (!width || !height || width < 80 || height < 80) continue;

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            if (typeof ImageBitmap !== 'undefined' && img.bitmap instanceof ImageBitmap) {
              ctx.drawImage(img.bitmap, 0, 0);
            } else if (img.data) {
              const src: Uint8Array = img.data;
              const out = ctx.createImageData(width, height);
              const channels = src.length / (width * height);
              for (let p = 0; p < width * height; p++) {
                if (channels >= 4) {
                  out.data[p * 4] = src[p * 4];
                  out.data[p * 4 + 1] = src[p * 4 + 1];
                  out.data[p * 4 + 2] = src[p * 4 + 2];
                  out.data[p * 4 + 3] = src[p * 4 + 3];
                } else if (channels >= 3) {
                  out.data[p * 4] = src[p * 3];
                  out.data[p * 4 + 1] = src[p * 3 + 1];
                  out.data[p * 4 + 2] = src[p * 3 + 2];
                  out.data[p * 4 + 3] = 255;
                } else {
                  out.data[p * 4] = src[p];
                  out.data[p * 4 + 1] = src[p];
                  out.data[p * 4 + 2] = src[p];
                  out.data[p * 4 + 3] = 255;
                }
              }
              ctx.putImageData(out, 0, 0);
            } else {
              continue;
            }

            const blob: Blob | null = await new Promise((resolve) =>
              canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
            );
            if (!blob) continue;

            const url = await uploadEditorBlob(blob, 'pdf', imageCount++);
            htmlParts.push(
              `<figure data-resizable-image><img src="${url}" alt="" /></figure>`
            );
          }
        } catch (imgError) {
          console.warn('No se pudieron extraer imágenes de la página', pageNum, imgError);
        }
      }

      if (!textFound && imageCount === 0) {
        toast({
          title: 'PDF sin texto seleccionable',
          description: 'Parece un PDF escaneado. Convierte el documento a .docx o pega el texto manualmente.',
          variant: 'destructive',
        });
        return;
      }

      const html = htmlParts.join('');
      editor.commands.setContent(html, { emitUpdate: true } as any);
      onChange(editor.getHTML(), editor.getJSON() as Json);

      toast({
        title: 'PDF importado',
        description: `${pdf.numPages} página(s)${imageCount > 0 ? ` y ${imageCount} imagen(es)` : ''} cargadas en el editor`,
      });
    } catch (error) {
      console.error('Error importing .pdf:', error);
      toast({
        title: 'Error',
        description: 'No se pudo importar el PDF',
        variant: 'destructive',
      });
    } finally {
      setImportingPdf(false);
    }
  }, [editor, onChange, toast, uploadEditorBlob]);

  const handlePdfInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePdfImport(file);
    }
    e.target.value = '';
  }, [handlePdfImport]);


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
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handlePdfInputChange}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => pdfInputRef.current?.click()}
          disabled={importingPdf}
          title="Importar PDF"
          className="gap-1 shadow-sm hover:shadow hover:bg-background"
        >
          {importingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileType2 className="h-4 w-4" />
          )}
          <span className="text-xs">Import PDF</span>
        </Button>


      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
