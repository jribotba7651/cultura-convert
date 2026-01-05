import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageNode } from './ResizableImageNode';

export interface ResizableImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: { src: string; alt?: string; title?: string; width?: number; caption?: string }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      caption: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-resizable-image]',
        getAttrs: (element) => {
          const img = element.querySelector('img');
          const figcaption = element.querySelector('figcaption');
          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
            title: img?.getAttribute('title'),
            width: img?.getAttribute('width') ? parseInt(img.getAttribute('width')!) : null,
            caption: figcaption?.textContent || null,
          };
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          title: element.getAttribute('title'),
          width: element.getAttribute('width') ? parseInt(element.getAttribute('width')!) : null,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, ...imgAttrs } = HTMLAttributes;
    
    if (caption) {
      return [
        'figure',
        { 'data-resizable-image': '' },
        ['img', mergeAttributes(this.options.HTMLAttributes, imgAttrs, { width: imgAttrs.width || undefined })],
        ['figcaption', {}, caption],
      ];
    }
    
    return [
      'figure',
      { 'data-resizable-image': '' },
      ['img', mergeAttributes(this.options.HTMLAttributes, imgAttrs, { width: imgAttrs.width || undefined })],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
