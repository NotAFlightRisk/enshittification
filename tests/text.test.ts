import { describe, expect, it } from 'vitest';
import { htmlToText, missingNumbers, quoteFound } from '#lib/text.ts';

describe('quoteFound', () => {
  it('ignores case, spacing and curly quotes', () => {
    const page = 'We\u2019re making the\u00a0dislike   count private across YouTube.';
    expect(quoteFound("we're making the dislike count PRIVATE", page)).toBe(true);
  });

  it('fails a sentence the page never says', () => {
    expect(
      quoteFound('dislikes are gone forever', 'We are making the dislike count private.')
    ).toBe(false);
  });
});

describe('missingNumbers', () => {
  it('finds a number no source has', () => {
    expect(
      missingNumbers('It went from $9.99 to $10.99 in 2023.', 'now $10.99 since July 2023')
    ).toEqual(['$9.99']);
  });

  it('matches numbers however they are written', () => {
    expect(missingNumbers('$1,000 and $60', 'costs 1000 dollars, or 60.00 a month')).toEqual([]);
  });

  it('lets off a from price and a matching percentage', () => {
    const exempt = new Set(['9.99', '10%']);
    expect(missingNumbers('$9.99 to $10.99, a 10% rise', 'now $10.99', exempt)).toEqual([]);
  });
});

describe('htmlToText', () => {
  it('reads text out of tags, entities and script data', () => {
    const html = '<p>Price: &pound;12.99</p><script>{"price":"\\u002410.99"}</script>';
    expect(htmlToText(html)).toContain('£12.99');
    expect(htmlToText(html)).toContain('$10.99');
  });
});
