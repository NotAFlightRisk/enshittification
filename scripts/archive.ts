import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { isMap, isSeq, parse, parseDocument, type Document } from 'yaml';
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

type Path = (string | number)[];

/** Paths to every source map in a service file that's still waiting on a snapshot */
function pending(doc: Document) {
  const found: Path[] = [];
  const walk = (node: unknown, path: Path) => {
    if (isMap(node)) {
      if (node.get('archive') === 'pending' && node.has('url')) found.push(path);
      for (const pair of node.items)
        walk(pair.value, [...path, String((pair.key as { value: string }).value)]);
    } else if (isSeq(node)) node.items.forEach((item, index) => walk(item, [...path, index]));
  };
  walk(doc.contents, []);
  return found;
}

const withoutArchives = (text: string) =>
  JSON.stringify(parse(text), (key, value) => (key === 'archive' ? undefined : value));

let saved = 0;
let failed = 0;
for (const { id, file } of loadServices()) {
  if (positionals.length && !positionals.includes(id)) continue;
  const before = readFileSync(file, 'utf8');
  const doc = parseDocument(before);
  for (const path of pending(doc)) {
    if (Date.now() > deadline) break;
    const url = String(doc.getIn([...path, 'url']));
    try {
      const snapshot = (await latestCapture(url)) ?? (await save(url));
      doc.setIn([...path, 'archive'], snapshot);
      saved++;
      console.log(`✓ ${url}\n  ${snapshot}`);
    } catch (error) {
      failed++;
      console.log(`✗ ${url} stays pending (${(error as Error).message})`);
    }
    await new Promise((done) => setTimeout(done, spacing));
  }
  const after = doc.toString({ lineWidth: 0 });
  if (after === before) continue;
  if (withoutArchives(after) !== withoutArchives(before))
    throw new Error(`${file}: writing the snapshots back would change more than archive fields`);
  writeFileSync(file, after);
}

console.log(`\n${plural(saved, 'snapshot')} saved, ${failed} still pending`);
if (Date.now() > deadline) console.log(`Stopped at the ${args.minutes} minute cap`);
