import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { isMap, isSeq, LineCounter, parseDocument, type Node } from 'yaml';
import type { Cpi, Region } from '#lib/data/types.ts';

export const dataDir = resolve(process.env.DATA_DIR ?? 'data');

/** A YAML file as parsed, plus a way back from a path in it to its line */
export interface YamlFile {
  id: string;
  file: string;
  raw: unknown;
  errors: { line: number; message: string }[];
  lineOf: (path: (string | number)[]) => number;
}

export const readYaml = (file: string) => parseYaml(readFileSync(file, 'utf8'), file);

export function parseYaml(text: string, file: string): YamlFile {
  const lines = new LineCounter();
  const doc = parseDocument(text, { lineCounter: lines });

  const lineOf = (path: (string | number)[]) => {
    let node: unknown = doc.contents;
    let offset = (node as Node | null)?.range?.[0] ?? 0;
    for (const step of path) {
      const next = isMap(node)
        ? node.items.find(({ key }) => (key as { value?: unknown })?.value === step)
        : isSeq(node) && typeof step === 'number'
          ? { key: node.items[step], value: node.items[step] }
          : undefined;
      if (!next) break;
      offset = (next.key as Node | undefined)?.range?.[0] ?? offset;
      node = next.value;
    }
    return lines.linePos(offset).line;
  };

  return {
    id: basename(file).replace(/\.ya?ml$/, ''),
    file,
    raw: doc.errors.length ? undefined : doc.toJS(),
    errors: doc.errors.map(({ linePos, message }) => ({
      line: linePos?.[0].line ?? 1,
      message: message.split('\n')[0]
    })),
    lineOf
  };
}

export const loadServices = (dir = dataDir) =>
  readdirSync(join(dir, 'services'))
    .filter((name) => /\.ya?ml$/.test(name))
    .sort()
    .map((name) => readYaml(join(dir, 'services', name)));

export const loadCompanies = (dir = dataDir) => readYaml(join(dir, 'companies.yaml'));

export function loadRedirects(dir = dataDir) {
  const file = join(dir, 'redirects.yaml');
  return existsSync(file) ? readYaml(file) : undefined;
}

export const loadCpi = (region: Region, dir = dataDir): Cpi =>
  JSON.parse(readFileSync(join(dir, 'cpi', `${region.toLowerCase()}.json`), 'utf8'));
