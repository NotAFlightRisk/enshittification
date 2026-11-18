import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { isMap, isScalar, isSeq, parse, parseDocument, type Scalar } from 'yaml';
import { loadServices } from '#lib/data/load.ts';
import { plural } from '#lib/format.ts';
import { latestCapture, save } from './wayback.ts';

// Saves every `archive: pending` source to the Wayback Machine and writes the snapshot back

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: { minutes: { type: 'string', default: '30' } }
});
const deadline = Date.now() + Number(args.minutes) * 60_000;
const spacing = Number(process.env.ARCHIVE_GAP_MS ?? 20_000);

/** Every `archive: pending` value in a file, with the URL it belongs to */
function pending(text: string) {
  const found: { url: string; value: Scalar }[] = [];
  const walk = (node: unknown) => {
    if (isMap(node)) {
      const value = node.get('archive', true);
      if (isScalar(value) && value.value === 'pending' && node.has('url'))
        found.push({ url: String(node.get('url')), value });
      for (const pair of node.items) walk(pair.value);
    } else if (isSeq(node)) node.items.forEach(walk);
  };
  walk(parseDocument(text).contents);
  return found;
}

const withoutArchives = (text: string) =>
  JSON.stringify(parse(text), (key, value) => (key === 'archive' ? undefined : value));

let saved = 0;
let failed = 0;
for (const { id, file } of loadServices()) {
  if (positionals.length && !positionals.includes(id)) continue;
  const before = readFileSync(file, 'utf8');
  const swaps: { start: number; end: number; snapshot: string }[] = [];
  for (const { url, value } of pending(before)) {
    if (Date.now() > deadline) break;
    try {
      const snapshot = (await latestCapture(url)) ?? (await save(url));
      swaps.push({ start: value.range![0], end: value.range![1], snapshot });
      saved++;
      console.log(`✓ ${url}\n  ${snapshot}`);
    } catch (error) {
      failed++;
      console.log(`✗ ${url} stays pending (${(error as Error).message})`);
    }
    await new Promise((done) => setTimeout(done, spacing));
  }
  if (!swaps.length) continue;
  // spliced into the text from the end back, so nothing else in the file moves
  const after = swaps
    .sort((a, b) => b.start - a.start)
    .reduce(
      (text, { start, end, snapshot }) => text.slice(0, start) + snapshot + text.slice(end),
      before
    );
  if (withoutArchives(after) !== withoutArchives(before))
    throw new Error(`${file}: writing the snapshots back would change more than archive fields`);
  writeFileSync(file, after);
}

console.log(`\n${plural(saved, 'snapshot')} saved, ${failed} still pending`);
if (Date.now() > deadline) console.log(`Stopped at the ${args.minutes} minute cap`);
