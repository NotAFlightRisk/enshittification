import type { Category } from '#lib/data/types.ts';

interface Shape {
  d: string;
  fill?: boolean;
}

/** One glyph per kind of change, on a 24-unit grid, bold enough to read at 16px */
export const glyphs: Record<Category, Shape[]> = {
  'price-rise': [
    { d: 'M12 3.5v17' },
    { d: 'M8 7.5l4-4 4 4' },
    {
      d: 'M16 11.2c-.4-1.3-1.9-2.1-4-2.1-2.3 0-3.8 1-3.8 2.5 0 3.6 7.8 1.6 7.8 5.3 0 1.6-1.6 2.6-4 2.6-2.2 0-3.7-.8-4.1-2.2'
    }
  ],
  ads: [
    { d: 'M4 9h4l8-4.5v15L8 15H4z', fill: true },
    { d: 'M7.5 15l1.6 4.5' },
    { d: 'M19 9.5c.9 1.5.9 3.5 0 5' }
  ],
  paywall: [
    { d: 'M8.2 11V8.3a3.8 3.8 0 0 1 7.6 0V11' },
    {
      d: 'M5.5 10.5h13v9.5h-13zM12 13.5a1.5 1.5 0 0 0-.8 2.8V18h1.6v-1.7a1.5 1.5 0 0 0-.8-2.8z',
      fill: true
    }
  ],
  'removed-feature': [
    { d: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4z', fill: true },
    { d: 'M14.5 14.5l4 4M18.5 14.5l-4 4' }
  ],
  'api-restriction': [
    { d: 'M9.5 3.5v4.5M14.5 3.5v4.5' },
    { d: 'M6 8h12v3.5a6 6 0 0 1-12 0z', fill: true },
    { d: 'M12 17.5v3' }
  ],
  tracking: [
    { d: 'M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6z' },
    { d: 'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z', fill: true }
  ],
  'lock-out': [
    { d: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM6.8 10.5h10.4v3H6.8z', fill: true }
  ],
  bricked: [
    {
      d: 'M8.5 3.5h7A1.5 1.5 0 0 1 17 5v14a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19V5a1.5 1.5 0 0 1 1.5-1.5z'
    },
    { d: 'M10 9.5l4 4.5M14 9.5l-4 4.5' }
  ],
  ai: [
    {
      d: 'M10.5 3.5c.6 4.3 2.4 6.1 6.7 6.7-4.3.6-6.1 2.4-6.7 6.7-.6-4.3-2.4-6.1-6.7-6.7 4.3-.6 6.1-2.4 6.7-6.7z',
      fill: true
    },
    {
      d: 'M17.5 13.5c.3 2 1.1 2.8 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.2 2.7-1 3-3z',
      fill: true
    }
  ]
};

/** How the outlined parts of every glyph are drawn */
export const stroke = {
  'stroke-width': 2.4,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
} as const;

const strokeAttributes = Object.entries(stroke)
  .map(([key, value]) => `${key}="${value}"`)
  .join(' ');

/** A glyph as standalone SVG markup, for places that can't use the sprite */
export function glyphSvg(kind: Category, plate: string, ink: string) {
  const shapes = glyphs[kind]
    .map(({ d, fill }) =>
      fill
        ? `<path d="${d}" fill="${ink}" fill-rule="evenodd"/>`
        : `<path d="${d}" fill="none" stroke="${ink}" ${strokeAttributes}/>`
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28"><rect x="-1" y="-1" width="26" height="26" rx="3.5" fill="${plate}" stroke="#000" stroke-width="2"/>${shapes}</svg>`;
}
