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

const toTitleishCase = (text: string): string => {
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (!letters) return text;
  const upperRatio = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length / letters.length;
  if (upperRatio < 0.85) return text;
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const endsSentence = (text: string) => /[.!?:;"»”)\]]$/.test(text.trim());
const startsContinuation = (text: string) => /^[a-záéíóúñ,;)]/.test(text.trim());

const isHeadingCandidate = (text: string) => {
  if (text.length === 0 || text.length > 90) return false;
  if (endsSentence(text) && !/:$/.test(text)) return false;
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letters.length < 3) return false;
  const upperRatio = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length / letters.length;
  return upperRatio >= 0.7 && text.split(/\s+/).length <= 12;
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

  const output: string[] = [];
  let openParagraph: string[] = [];

  const flush = () => {
    if (!openParagraph.length) return;
    const text = normalizeText(openParagraph.join(' '));
    if (text) output.push(`<p>${text}</p>`);
    openParagraph = [];
  };

  Array.from(root.children).forEach((el) => {
    const tag = el.tagName.toLowerCase();

    // Non-text blocks pass through untouched.
    if (['figure', 'img', 'ul', 'ol', 'blockquote', 'hr', 'table', 'pre'].includes(tag)) {
      flush();
      output.push(el.outerHTML);
      return;
    }

    if (/^h[1-6]$/.test(tag)) {
      flush();
      const text = toTitleishCase(normalizeText(collapseSpacedCaps(el.textContent || '')));
      if (text) output.push(`<h2>${text}</h2>`);
      return;
    }

    // Paragraph-like block
    const raw = el.textContent || '';
    const spacedFixed = collapseSpacedCaps(raw);
    const text = normalizeText(spacedFixed);

    if (!text) {
      flush();
      return;
    }

    if (isHeadingCandidate(text)) {
      flush();
      output.push(`<h2>${toTitleishCase(text)}</h2>`);
      return;
    }

    const inner = el.innerHTML.includes('<a ') ? normalizeText(el.innerHTML) : text;
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
