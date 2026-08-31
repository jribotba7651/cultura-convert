// Share a product (or any URL) via the native share sheet when available,
// falling back to copying the link to the clipboard.
export type ShareResult = 'shared' | 'copied' | 'failed';

export const shareProduct = async (options: {
  title: string;
  text?: string;
  url: string;
}): Promise<ShareResult> => {
  const { title, text, url } = options;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      // User cancelled the share sheet — treat as no-op, not failure
      if ((err as Error)?.name === 'AbortError') return 'shared';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
};
