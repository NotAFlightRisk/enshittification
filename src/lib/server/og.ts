import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import satori from 'satori';
import { formatDate, yearOf } from '#lib/dates.ts';
import { money, percent, plural } from '#lib/format.ts';
import { marks } from '#lib/strip.ts';
import { charted, league, stepsBy } from '#lib/prices.ts';
import { firstYear, productName } from '#lib/seo.ts';
import { categories, type Category, type Entry } from '#lib/data/types.ts';
import { ogSize, site } from '#lib/site.ts';
import { data, stats } from '#lib/server/data.ts';

// Share cards drawn at build time: satori lays the divs out as SVG, resvg makes the PNG

// the light theme from app.css, in hex since satori doesn't speak oklch
const colour = {
  surface: '#f5f7f9',
  text: '#13161c',
  muted: '#4f5359',
  faint: '#ced1d5'
};
const ink: Record<Category, string> = {
  'price-rise': '#9d671c',
  ads: '#754d9e',
  paywall: '#1f689d',
  'removed-feature': '#1e7777',
  'api-restriction': '#3b723e',
  tracking: '#914373',
  'lock-out': '#48528f',
  bricked: '#4a4d53',
  ai: '#6c6d29'
};

type Child = Node | string | false | undefined;
interface Node {
  type: string;
  props: Record<string, unknown>;
}

const div = (style: object, ...children: Child[]): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.filter(Boolean) }
});

const logo = `data:image/svg+xml;base64,${readFileSync(resolve('static/favicon.svg')).toString('base64')}`;

const frame = (aside: string, ...content: Child[]) =>
  div(
    {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      flexDirection: 'column',
      padding: '0 64px 52px',
      borderTop: `14px solid ${colour.text}`,
      background: colour.surface,
      color: colour.text,
      fontFamily: 'Public Sans'
    },
    div(
      {
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 0',
        borderBottom: `2px solid ${colour.text}`
      },
      div(
        { alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' },
        { type: 'img', props: { src: logo, width: 52, height: 52 } },
        site.name
      ),
      div({ fontSize: 24, color: colour.muted }, aside)
    ),
    div(
      { flexGrow: 1, flexDirection: 'column', justifyContent: 'space-between', paddingTop: 40 },
      ...content
    )
  );

const headline = (text: string, size = 76) =>
  div(
    {
      fontSize: size,
      fontWeight: 800,
      letterSpacing: '-0.035em',
      lineHeight: 1.02,
      textWrap: 'balance'
    },
    text
  );

const lede = (title: string, text: string) =>
  div(
    { flexDirection: 'column', gap: 22 },
    headline(title, title.length > 60 ? 60 : 76),
    div({ fontSize: 32, color: colour.muted, lineHeight: 1.3 }, text)
  );

const tag = (category: Category) =>
  div(
    { alignItems: 'center', gap: 12, fontSize: 28, color: colour.muted },
    div({ width: 18, height: 18, background: ink[category] }),
    categories[category]
  );

/** A strip of marks, as on the site, with years under it */
function strip(changes: Entry[], from: number, to: number, height: number) {
  const today = data().built;
  const years = to - from + 1;
  return div(
    { flexDirection: 'column', gap: 8 },
    div(
      { position: 'relative', height, borderBottom: `2px solid ${colour.faint}` },
      ...marks(changes, from, to, today).map((mark) =>
        div({
          position: 'absolute',
          left: `${mark.at}%`,
          top: 0,
          width: mark.hollow ? 10 : 6,
          height,
          background: mark.hollow ? 'transparent' : ink[mark.category],
          border: mark.hollow ? `3px solid ${ink[mark.category]}` : 'none'
        })
      )
    ),
    div(
      { fontSize: 20, color: colour.muted },
      ...Array.from({ length: years }, (_, index) =>
        div({ width: `${100 / years}%` }, years > 8 && index % 2 ? '' : String(from + index))
      )
    )
  );
}

function homeImage() {
  const { services, built } = data();
  const counts = stats();
  const to = Math.max(counts.last, yearOf(built));
  return frame(
    `${plural(counts.changes, 'change')} · ${plural(counts.services, 'service')}`,
    headline('Every time big tech made it worse, dated and sourced.', 64),
    div(
      { flexDirection: 'column', gap: 14 },
      ...services
        .slice(0, 5)
        .map((service) =>
          div(
            { alignItems: 'center', gap: 24 },
            div({ width: 170, fontSize: 26, fontWeight: 800 }, service.name),
            div(
              { flexGrow: 1, flexDirection: 'column' },
              strip(service.changes, counts.first, to, 30)
            )
          )
        )
    )
  );
}

function serviceImage(id: string) {
  const service = data().services.find((item) => item.service === id)!;
  const from = firstYear(service.changes);
  const to = Math.max(yearOf(service.changes[0].date), yearOf(data().built));
  return frame(
    `${plural(service.changes.length, 'change')} since ${from}`,
    lede(
      service.name,
      `The latest, ${formatDate(service.changes[0].date)}: ${service.changes[0].title}`
    ),
    strip(service.changes, from, to, 90)
  );
}

function changeImage(entry: Entry) {
  const prices = entry.before && entry.after;
  return frame(
    entry.serviceName,
    div(
      { flexDirection: 'column', gap: 20 },
      div({ fontSize: 34, fontWeight: 700, color: colour.muted }, formatDate(entry.date)),
      headline(entry.title, entry.title.length > 55 ? 58 : 70)
    ),
    prices
      ? div(
          { alignItems: 'flex-end', gap: 36, justifyContent: 'space-between' },
          div(
            { alignItems: 'baseline', gap: 28 },
            div(
              {
                fontSize: 64,
                fontWeight: 800,
                color: colour.muted,
                textDecoration: 'line-through'
              },
              entry.before!
            ),
            div({ fontSize: 80, fontWeight: 800, letterSpacing: '-0.03em' }, entry.after!)
          ),
          tag(entry.category)
        )
      : tag(entry.category)
  );
}

function priceImage(id: string) {
  const service = data().services.find((item) => item.service === id)!;
  const [plan] = charted(service.plans);
  const steps = stepsBy(plan, data().built);
  const [first, last] = [steps[0], steps.at(-1)!];
  return frame(
    `${plan.name}, ${plan.region}`,
    headline(`${productName(service)} price history`),
    div(
      { alignItems: 'baseline', gap: 28 },
      div(
        { fontSize: 60, fontWeight: 800, color: colour.muted },
        `${money(first.price, plan.currency)} in ${yearOf(first.date)}`
      ),
      div(
        { fontSize: 84, fontWeight: 800, letterSpacing: '-0.03em' },
        `${money(last.price, plan.currency)} now`
      ),
      div(
        { fontSize: 40, fontWeight: 700, color: ink['price-rise'] },
        percent(last.price / first.price - 1)
      )
    )
  );
}

function leagueImage() {
  const { plans, cpi, built } = data();
  const { ranked } = league(plans, cpi, '2020-01', built);
  return frame(
    'Since January 2020',
    headline('Which subscriptions have gone up most', 64),
    div(
      { flexDirection: 'column', gap: 10 },
      ...ranked.slice(0, 4).map((rise, index) =>
        div(
          {
            justifyContent: 'space-between',
            fontSize: 30,
            paddingBottom: 8,
            borderBottom: `2px solid ${colour.faint}`
          },
          div(
            { gap: 18 },
            div({ color: colour.muted, width: 30 }, String(index + 1)),
            `${rise.plan.serviceName} ${rise.plan.name} (${rise.plan.region})`
          ),
          div({ fontWeight: 800 }, percent(rise.rise))
        )
      )
    )
  );
}

const pages: Record<string, [string, string]> = {
  bill: [
    'Your bill',
    'What your subscriptions cost now against any year since 2010, with inflation alongside.'
  ],
  latest: ['Latest', 'Every change in the index, newest first.'],
  data: ['The data', 'Every change as JSON and CSV, under CC BY 4.0.'],
  about: ['About the index', 'How every entry is sourced, archived and checked.'],
  corrections: ['Corrections', 'Every fix, and how to report one.'],
  '404': ['Nothing here', 'This page has been removed to improve your experience.']
};

/** Every page that gets a card, named the way ogPage() in site.ts names them */
export function cardPages() {
  const { services, changes, companies } = data();
  return [
    'index',
    'prices',
    ...Object.keys(pages),
    ...services.map(({ service }) => service),
    ...services
      .filter(({ plans }) => charted(plans).length)
      .map(({ service }) => `${service}--price-history`),
    ...changes.map(({ service, id }) => `${service}--${id}`),
    ...Object.keys(categories).map((category) => `category--${category}`),
    ...companies.map(({ id }) => `company--${id}`),
    ...[...new Set(changes.map(({ date }) => yearOf(date)))].map((year) => `year--${year}`)
  ];
}

function pickImage(page: string) {
  const { services, changes, companies } = data();
  const [first, second] = page.split('--');
  if (page === 'index') return homeImage();
  if (page === 'prices') return leagueImage();
  if (pages[page]) return frame(site.short, lede(...pages[page]));
  if (first === 'category' && second in categories) {
    const list = changes.filter(({ category }) => category === second);
    return frame(
      plural(list.length, 'change'),
      lede(categories[second as Category], `Every one logged, newest first, dated and sourced.`)
    );
  }
  if (first === 'company') {
    const company = companies.find(({ id }) => id === second)!;
    const own = services.filter((service) => service.company === company.id);
    return frame(
      plural(own.length, 'service'),
      lede(
        company.name,
        `Every change at ${own.map(({ name }) => name).join(', ')}, dated and sourced.`
      )
    );
  }
  if (first === 'year') {
    const list = changes.filter(({ date }) => String(yearOf(date)) === second);
    return frame(
      plural(list.length, 'change'),
      lede(
        `What got worse in ${second}`,
        `${plural(list.length, 'change')}, each dated and sourced.`
      )
    );
  }
  if (second === 'price-history') return priceImage(first);
  if (second)
    return changeImage(changes.find(({ service, id }) => service === first && id === second)!);
  return serviceImage(first);
}

let fonts: { name: string; data: Buffer; weight: 400 | 700 | 800; style: 'normal' }[] | undefined;
let wasm: Promise<void> | undefined;

async function rasterise(svg: string, width?: number) {
  wasm ??= initWasm(readFileSync(resolve('node_modules/@resvg/resvg-wasm/index_bg.wasm')));
  await wasm;
  const fitTo = width ? { mode: 'width' as const, value: width } : undefined;
  return Buffer.from(new Resvg(svg, { fitTo }).render().asPng());
}

export async function drawPage(page: string) {
  if (!cardPages().includes(page)) return undefined;
  fonts ??= ([400, 700, 800] as const).map((weight) => ({
    name: 'Public Sans',
    data: readFileSync(
      resolve(`node_modules/@fontsource/public-sans/files/public-sans-latin-${weight}-normal.woff`)
    ),
    weight,
    style: 'normal'
  }));
  return rasterise(await satori(pickImage(page) as never, { ...ogSize, fonts }));
}

/** The favicon at a size search engines will take as a logo */
export const drawLogo = () => rasterise(readFileSync(resolve('static/favicon.svg'), 'utf8'), 512);
