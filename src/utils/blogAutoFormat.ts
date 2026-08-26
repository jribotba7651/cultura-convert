/**
 * Auto-format helpers for blog content produced by imports (.docx / PDF).
 *
 * Typical problems this fixes:
 *  - Headings that come out letter-spaced ("I N  T H E  M A C H I N E")
 *  - Paragraphs broken mid-sentence into many tiny <p> blocks
 *  - Empty paragraphs / stray whitespace and non-breaking spaces
 *  - Short standalone ALL-CAPS lines that should be section headings
 */

const collapseSpacedCaps = (text: string): string => {
  // "I N  T H E  M A C H I N E" -> "IN THE MACHINE"
  const stripped = text.replace(/\s+/g, '');
  if (stripped.length < 4) return text;

  const singles = text.trim().split(/\s+/);
  const looksSpaced =
    singles.length >= 4 && singles.filter((t) => t.length === 1).length / singles.length >= 0.7;
  if (!looksSpaced) return text;

  // Double (or more) spaces separate words in this style.
  return text
    .trim()
    .split(/\s{2,}/)
    .map((word) => word.replace(/\s+/g, ''))
    .join(' ')
    .trim();
};

const normalizeText = (text: string): string =>
  text
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const endsSentence = (text: string) => /[.!?:;"»”)\]]$/.test(text.trim());
const startsContinuation = (text: string) => /^[a-záéíóúñ,;)]/.test(text.trim());

const escapeHtml = (text: string): string => {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
};

/**
 * Cleans and re-structures blog HTML. Images, figures, lists, blockquotes and
 * links are preserved as-is; only text blocks are normalized and merged.
 */
export const autoFormatBlogHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return html ?? '';

  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html');
  const root = doc.getElementById('root');
  if (!root) return html;

  type Block = { tag: string; text: string; inner: string; outer: string };

  const blocks: Block[] = Array.from(root.children).map((el) => {
    const tag = el.tagName.toLowerCase();
    const originalText = normalizeText(el.textContent || '');
    const text = normalizeText(collapseSpacedCaps(originalText));
    // Preserve authored inline markup. Only replace it when repairing a
    // letter-spaced import because the text itself must change in that case.
    const inner = text === originalText ? el.innerHTML.trim() : escapeHtml(text);
    return { tag, text, inner, outer: el.outerHTML };
  });

  const output: string[] = [];
  let openParagraph: string[] = [];

  const flush = () => {
    if (!openParagraph.length) return;
    const inner = openParagraph.join(' ').trim();
    if (inner) output.push(`<p>${inner}</p>`);
    openParagraph = [];
  };

  blocks.forEach((block) => {
    const { tag, text, inner, outer } = block;

    // Non-text blocks pass through untouched.
    if (['figure', 'img', 'ul', 'ol', 'blockquote', 'hr', 'table', 'pre'].includes(tag)) {
      flush();
      output.push(outer);
      return;
    }

    if (!text) {
      flush();
      return;
    }

    if (/^h[1-6]$/.test(tag)) {
      flush();
      output.push(`<${tag}>${inner}</${tag}>`);
      return;
    }

    const previous = openParagraph[openParagraph.length - 1];
    if (previous && !endsSentence(previous) && startsContinuation(text)) {
      // Broken mid-sentence line: keep it in the same paragraph.
      openParagraph.push(inner);
      return;
    }

    flush();
    openParagraph.push(inner);
  });

  flush();

  return output.join('');
};

