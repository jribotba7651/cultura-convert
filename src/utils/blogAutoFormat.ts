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

const ACRONYMS = new Set([
  'AI', 'IA', 'IT', 'LLM', 'LLC', 'GPT', 'API', 'USA', 'EEUU', 'ONU', 'LSD',
  'FM', 'AM', 'PM', 'TV', 'UCSF', 'NASA', 'ADN', 'DNA', 'CEO', 'PDF', 'URL',
]);

const toTitleishCase = (text: string): string => {
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (!letters) return text;
  const upperRatio = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length / letters.length;
  if (upperRatio < 0.85) return text;

  const lowered = text
    .split(' ')
    .map((word) => {
      const bare = word.replace(/[^A-Za-z]/g, '');
      if (ACRONYMS.has(bare)) return word;
      const lower = word.toLowerCase();
      // Keep the English pronoun "I" capitalized.
      return lower === 'i' ? 'I' : lower;
    })
    .join(' ');

  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
};

const endsSentence = (text: string) => /[.!?:;"»”)\]]$/.test(text.trim());
const startsContinuation = (text: string) => /^[a-záéíóúñ,;)]/.test(text.trim());

const upperRatio = (text: string) => {
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (!letters) return 0;
  return letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length / letters.length;
};

const isTitleCaseLine = (text: string) => {
  const words = text.split(/\s+/).filter((w) => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(w));
  if (words.length === 0 || words.length > 10) return false;
  const capped = words.filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w)).length;
  return capped / words.length >= 0.6;
};

const isHeadingCandidate = (text: string) => {
  if (text.length === 0 || text.length > 90) return false;
  if (endsSentence(text) && !/:$/.test(text)) return false;
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letters.length < 3) return false;
  if (upperRatio(text) >= 0.7 && text.split(/\s+/).length <= 12) return true;
  // Short mixed-case title lines ("In the Machine", "We Trust")
  return text.length <= 60 && isTitleCaseLine(text);
};

/**
 * Page furniture produced by PDF exports: separators, running headers,
 * page numbers, and image placeholder notes.
 */
const isNoiseLine = (text: string) => {
  const t = text.trim();
  if (!t) return true;
  if (/^[\s·•§¶*_\-–—.]+$/.test(t)) return false; // handled as separator below
  if (/^\d{1,3}\s*\/\s*\d{1,3}$/.test(t)) return true; // "02 / 12"
  if (/\b\d{1,3}\s*\/\s*\d{1,3}\s*$/.test(t) && upperRatio(t) >= 0.7) return true; // running header
  if (/^image\s*\d+\s*[·•\-–—:]/i.test(t)) return true; // "Image 2 · Woman at 3 AM ..."
  if (/see prompt document\.?$/i.test(t)) return true;
  if (/·\s*20\d{2}\s*$/.test(t) && t.length <= 80 && upperRatio(t) >= 0.4) return true; // byline/footer
  return false;
};

const isSeparatorOnly = (text: string) => /^[\s·•§¶*_\-–—.]+$/.test(text.trim());

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
    const text = normalizeText(collapseSpacedCaps(el.textContent || ''));
    const inner = el.innerHTML.includes('<a ') ? normalizeText(el.innerHTML) : text;
    return { tag, text, inner, outer: el.outerHTML };
  });

  // Lines repeated across the document are running headers/footers.
  const counts = new Map<string, number>();
  blocks.forEach((b) => {
    if (b.text && b.text.length <= 90) {
      counts.set(b.text.toLowerCase(), (counts.get(b.text.toLowerCase()) || 0) + 1);
    }
  });
  const isRepeatedFurniture = (text: string) =>
    text.length <= 90 && (counts.get(text.toLowerCase()) || 0) >= 3;

  const output: string[] = [];
  let openParagraph: string[] = [];

  const flush = () => {
    if (!openParagraph.length) return;
    const text = normalizeText(openParagraph.join(' '));
    if (text) output.push(`<p>${text}</p>`);
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

    if (!text || isSeparatorOnly(text) || isNoiseLine(text) || isRepeatedFurniture(text)) {
      flush();
      return;
    }

    if (/^h[1-6]$/.test(tag) || isHeadingCandidate(text)) {
      flush();
      const heading = toTitleishCase(text);
      const last = output[output.length - 1];
      // Merge title lines split across two blocks ("In the Machine" + "We Trust")
      if (last && last.startsWith('<h2>') && last.endsWith('</h2>')) {
        const prevText = last.slice(4, -5);
        if (!endsSentence(prevText) && prevText.length + heading.length <= 90) {
          output[output.length - 1] = `<h2>${prevText} ${heading}</h2>`;
          return;
        }
      }
      output.push(`<h2>${heading}</h2>`);
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

