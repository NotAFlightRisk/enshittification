import { gunzipSync } from 'node:zlib';
import { htmlToText } from '#lib/text.ts';

// The one door to the Wayback Machine: one request at a time, 4s apart, and a minute's
// break on a 429, a 5xx or a refused connection before moving on, since it's free and promises
// nothing

export const userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0';

const gap = Number(process.env.WAYBACK_GAP_MS ?? 4000);
const cooldown = Number(process.env.WAYBACK_COOLDOWN_MS ?? 60_000);
let queue: Promise<unknown> = Promise.resolve();
let last = 0;

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));

export class Unavailable extends Error {}

/** A fetch to archive.org, queued behind every other one this process makes */
export function archived(url: string, init: RequestInit & { timeout?: number } = {}) {
  const turn = queue.then(async () => {
    await pause(Math.max(0, last + gap - Date.now()));
    try {
      const response = await fetch(url, {
        ...init,
        headers: { 'User-Agent': userAgent, ...init.headers },
        signal: AbortSignal.timeout(init.timeout ?? 90_000)
      });
      if (response.status === 429 || response.status >= 500) {
        await pause(cooldown);
        throw new Unavailable(`the archive answered ${response.status}`);
      }
      return response;
    } catch (error) {
      if (error instanceof Unavailable) throw error;
      await pause(cooldown);
      throw new Unavailable(`couldn't reach the archive (${(error as Error).message})`);
    } finally {
      last = Date.now();
    }
  });
  queue = turn.catch(() => {});
  return turn;
}

export const isSnapshot = (archive: string) =>
  /^https:\/\/web\.archive\.org\/web\/\d{14}\//.test(archive);

/** The raw page as captured, without the Wayback toolbar, un-gzipped if it came back gzipped */
export async function snapshotText(archive: string) {
  const raw = archive.replace(/\/web\/(\d{14})\//, '/web/$1id_/');
  const response = await archived(raw);
  if (!response.ok) throw new Error(`the snapshot answered ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  const html = (body[0] === 0x1f && body[1] === 0x8b ? gunzipSync(body) : body).toString('utf8');
  return htmlToText(html);
}

/** The newest capture of a URL that answered 200, or nothing */
export async function latestCapture(url: string) {
  const query = new URLSearchParams({
    url,
    output: 'json',
    fl: 'timestamp',
    filter: 'statuscode:200',
    limit: '-1'
  });
  const response = await archived(`https://web.archive.org/cdx/search/cdx?${query}`);
  const rows: string[][] = response.ok ? await response.json() : [];
  const stamp = rows.slice(1).at(-1)?.[0];
  return stamp ? `https://web.archive.org/web/${stamp}/${url}` : undefined;
}

/** Asks the archive to capture a page, which can take a couple of minutes and often fails */
export async function save(url: string) {
  const response = await archived(`https://web.archive.org/save/${url}`, {
    redirect: 'manual',
    timeout: 240_000
  });
  const location = response.headers.get('location') ?? '';
  const stamp = location.match(/\/web\/(\d{14})\//)?.[1];
  if (!stamp) throw new Error(`the save answered ${response.status} with no snapshot`);
  return `https://web.archive.org/web/${stamp}/${url}`;
}

/** A live page as text, or the reason it couldn't be read */
export async function livePage(url: string) {
  const response = await fetch(url, {
    headers: { 'User-Agent': userAgent, Accept: 'text/html,*/*', 'Accept-Language': 'en-US,en' },
    signal: AbortSignal.timeout(45_000)
  });
  const home = new URL(response.url).pathname === '/' && new URL(url).pathname !== '/';
  return {
    status: response.status,
    home,
    text: response.ok ? htmlToText(await response.text()) : ''
  };
}
