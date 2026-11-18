// plain-text helpers for checking an entry's words against the pages it cites

const entities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: '-',
  mdash: '-',
  hellip: '...',
  pound: '£',
  euro: '€',
  dollar: '$'
};

export const decodeEntities = (text: string) =>
  text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return entities[code.toLowerCase()] ?? match;
    const point =
      code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return Number.isFinite(point) ? String.fromCodePoint(point) : match;
  });

/** Everything readable in a page, script data included, since some sites keep the article there */
export function htmlToText(html: string) {
  const unescaped = html
    .replace(/\\u([\da-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\(["/])/g, '$1');
  return decodeEntities(unescaped.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
}

/** Lowercase, straight quotes, plain dashes, one space - so a quote matches however it's typeset */
export const normalise = (text: string) =>
  text
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/[   ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const quoteFound = (quote: string, text: string) =>
  normalise(text).includes(normalise(quote));

const number = /[$£€]?\d+(?:,\d{3})*(?:\.\d+)?%?/g;

/** "9.99" for "$9.99", "1000" for "1,000", "28" for "28%", "60" for "60.00" */
export const numberKey = (value: string) =>
  value
    .replace(/[$£€,%]/g, '')
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');

export const numbersIn = (text: string) => [...new Set(text.match(number) ?? [])];

/** Numbers in the claim that no source text has */
export function missingNumbers(claim: string, sourceText: string, exempt: Set<string> = new Set()) {
  const found = new Set(numbersIn(sourceText).map(numberKey));
  return numbersIn(claim).filter((value) => {
    const key = numberKey(value);
    return !found.has(key) && !exempt.has(value.endsWith('%') ? `${key}%` : key);
  });
}
