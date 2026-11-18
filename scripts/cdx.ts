import { parseArgs } from 'node:util';
import { archived } from './wayback.ts';

// Finds real URLs under a prefix in the Wayback index, so nobody types one from memory
// npm run cdx -- https://newsroom.spotify.com/2023 'price'

const { positionals } = parseArgs({ allowPositionals: true });
const [prefix, pattern = '.'] = positionals;
if (!prefix) throw new Error('usage: npm run cdx -- <url-prefix> [regex]');

const query = new URLSearchParams({
  url: prefix,
  matchType: 'prefix',
  output: 'json',
  fl: 'original,timestamp',
  filter: 'statuscode:200',
  collapse: 'urlkey',
  limit: '20000'
});
const response = await archived(`https://web.archive.org/cdx/search/cdx?${query}`, {
  timeout: 120_000
});
if (!response.ok) throw new Error(`the CDX search answered ${response.status}`);

const match = new RegExp(pattern, 'i');
const seen = new Set<string>();
for (const [original, stamp] of ((await response.json()) as string[][]).slice(1)) {
  const url = original
    .split('?')[0]
    .replace(/^http:/, 'https:')
    .replace(':80/', '/');
  if (!match.test(url) || seen.has(url)) continue;
  seen.add(url);
  console.log(`${stamp.slice(0, 8)} ${url}`);
}
