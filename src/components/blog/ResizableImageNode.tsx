import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState, useRef, useCallback, useEffect } from 'react';

export function ResizableImageNode({ node, updateAttributes, selected }: NodeViewProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { src, alt, title, width, caption } = node.attrs;

  const handleMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(imageRef.current?.offsetWidth || 300);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(100, Math.min(800, startWidth + diff));
    updateAttributes({ width: newWidth });
  }, [isResizing, startX, startWidth, updateAttributes]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleCaptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttributes({ caption: e.target.value });
  }, [updateAttributes]);

  return (
    <NodeViewWrapper className="relative my-4">
      <figure 
        ref={containerRef}
        className={`relative inline-block ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        style={{ width: width ? `${width}px` : 'auto' }}
      >
        <div className="relative group">
          <img
            ref={imageRef}
            src={src}
            alt={alt || ''}
            title={title || ''}
            className="max-w-full h-auto rounded-lg block"
            style={{ width: width ? `${width}px` : 'auto' }}
            draggable={false}
          />
          
          {/* Resize handles - only show when selected */}
          {selected && (
            <>
              {/* Top-left handle */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
              />
              {/* Top-right handle */}
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
              />
              {/* Bottom-left handle */}
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
              />
              {/* Bottom-right handle */}
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, 'se')}
              />
              {/* Right edge handle for easier resizing */}
              <div
                className="absolute top-1/2 -right-2 w-4 h-8 -translate-y-1/2 bg-primary/80 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onMouseDown={(e) => handleMouseDown(e, 'e')}
              >
                <div className="w-0.5 h-4 bg-white rounded" />
              </div>
            </>
          )}
        </div>
        
        {/* Caption input - always visible when selected or has caption */}
        {(selected || caption) && (
          <figcaption className="mt-2">
            <input
              type="text"
              value={caption || ''}
              onChange={handleCaptionChange}
              placeholder="Agregar descripción..."
              className="w-full text-sm text-muted-foreground text-center bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            />
          </figcaption>
        )}
      </figure>
    </NodeViewWrapper>
  );
}
