import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import satori from 'satori';
import { formatDate, yearOf } from '#lib/dates.ts';
import { money, percent, plural } from '#lib/format.ts';
import { glyphSvg } from '#lib/icons.ts';
import { fit, marks } from '#lib/strip.ts';
import { launched, league, stepsBy } from '#lib/prices.ts';
import { firstYear, productName, worstOf } from '#lib/seo.ts';
import {
  categories,
  isHollow,
  severities,
  type Category,
  type Entry,
  type Severity
} from '#lib/data/types.ts';
import { ogSize, site } from '#lib/site.ts';
import { data, stats } from '#lib/server/data.ts';

// Share cards drawn at build time: satori lays the divs out as SVG, resvg makes the PNG

// the light theme from app.css, since satori can't read CSS variables
const colour = { ground: '#e6e6e1', ink: '#000', soft: '#4a4a45', line: '#b8b8b1' };
const condensed = { fontFamily: 'Barlow Condensed', fontWeight: 700 };
const blank = { plate: '#fff', ink: '#000' };
const level: Record<Severity, typeof blank> = {
  1: { plate: '#ffc400', ink: '#000' },
  2: { plate: '#ff7a00', ink: '#000' },
  3: { plate: '#d42a1a', ink: '#fff' }
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

const dataUri = (svg: string | Buffer) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const logo = dataUri(readFileSync(resolve('static/favicon.svg')));

const tape = dataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="16"><defs><pattern id="t" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="24" fill="#ffc400"/><rect x="12" width="12" height="24" fill="#000"/></pattern></defs><rect width="1200" height="16" fill="url(#t)"/></svg>`
);

const img = (src: string, width: number, height = width) => ({
  type: 'img',
  props: { src, width, height }
});

function sign(kind: Category, size: number, severity?: Severity) {
  const { plate, ink } = severity ? level[severity] : blank;
  return img(dataUri(glyphSvg(kind, plate, ink)), size);
}

const inset = 64;

const frame = (aside: string, ...content: Child[]) =>
  div(
    {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      flexDirection: 'column',
      background: colour.ground,
      color: colour.ink,
      fontFamily: 'Libre Franklin'
    },
    img(tape, ogSize.width, 16),
    div(
      { flexGrow: 1, flexDirection: 'column', padding: `0 ${inset}px 52px` },
      div(
        {
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 0',
          borderBottom: `3px solid ${colour.ink}`
        },
        div(
          { ...condensed, alignItems: 'center', gap: 16, fontSize: 36 },
          img(logo, 56),
          site.name
        ),
        div({ fontSize: 24, color: colour.soft }, aside)
      ),
      div(
        { flexGrow: 1, flexDirection: 'column', justifyContent: 'space-between', paddingTop: 40 },
        ...content
      )
    )
  );

const headline = (text: string, size = 84) =>
  div({ ...condensed, fontSize: size, lineHeight: 1, textWrap: 'balance' }, text);

const lede = (title: string, text: string) =>
  div(
    { flexDirection: 'column', gap: 22 },
    headline(title, title.length > 60 ? 68 : 84),
    div({ fontSize: 32, color: colour.soft, lineHeight: 1.3 }, text)
  );

const tag = (category: Category) =>
  div({ alignItems: 'center', gap: 12, fontSize: 28 }, sign(category, 36), categories[category]);

/** A strip of signs on hazard tape, as on the site, with years under it */
function strip(changes: Entry[], from: number, to: number, size: number, labels = true) {
  const years = to - from + 1;
  const placed = marks(changes, from, to);
  const height = (Math.max(0, ...placed.map(({ lane }) => lane)) + 1) * (size + 6) + 8;
  return div(
    { flexDirection: 'column', gap: 8 },
    div(
      { position: 'relative', height },
      div(
        { position: 'absolute', inset: 'auto 0 0', height: 8, overflow: 'hidden' },
        img(tape, ogSize.width, 8)
      ),
      ...placed.map((mark) =>
        div(
          {
            position: 'absolute',
            left: `${mark.at}%`,
            bottom: 8 + mark.lane * (size + 6),
            marginLeft: -size / 2
          },
          sign(mark.category, size, isHollow(mark.status) ? undefined : mark.severity)
        )
      )
    ),
    labels &&
      div(
        { ...condensed, fontSize: 22, color: colour.soft },
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
  const shown = services.toSorted((a, b) => b.changes.length - a.changes.length).slice(0, 3);
  return frame(
    `${plural(counts.changes, 'change')} at ${plural(counts.services, 'service')}`,
    headline('Big tech gets worse after you sign up.', 68),
    div(
      { flexDirection: 'column', gap: 12 },
      ...shown.map((service, index) =>
        div(
          { alignItems: 'flex-end', gap: 24 },
          div({ ...condensed, width: 150, fontSize: 32, paddingBottom: 4 }, service.name),
          div(
            { flexGrow: 1, flexDirection: 'column' },
            strip(service.changes, counts.first, to, 26, index === shown.length - 1)
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
  const worst = worstOf(service.changes, data().built);
  return frame(
    `${plural(service.changes.length, 'change')} since ${from}`,
    lede(
      service.name,
      worst ? `${severities[worst.severity].name}: ${worst.title}` : service.changes[0].title
    ),
    strip(service.changes, from, to, Math.floor((ogSize.width - 2 * inset) * fit.wide))
  );
}

function changeImage(entry: Entry) {
  const short = (text?: string) => text !== undefined && text.length <= 24;
  const prices = short(entry.before) && short(entry.after);
  const hollow = isHollow(entry.status);
  const { plate, ink } = hollow ? blank : level[entry.severity];
  return frame(
    entry.serviceName,
    div(
      { flexDirection: 'column', gap: 20 },
      div(
        { alignItems: 'center', gap: 20 },
        div(
          {
            ...condensed,
            alignItems: 'center',
            gap: 14,
            padding: '6px 20px 6px 8px',
            border: `3px solid ${colour.ink}`,
            background: plate,
            color: ink,
            fontSize: 36,
            letterSpacing: 2
          },
          sign(entry.category, 44, hollow ? undefined : entry.severity),
          severities[entry.severity].name.toUpperCase()
        ),
        div({ fontSize: 30, color: colour.soft }, formatDate(entry.date))
      ),
      headline(entry.title, entry.title.length > 55 ? 66 : 80)
    ),
    prices
      ? div(
          { alignItems: 'flex-end', gap: 36, justifyContent: 'space-between' },
          div(
            { ...condensed, alignItems: 'baseline', gap: 28 },
            div(
              { fontSize: 64, color: colour.soft, textDecoration: 'line-through' },
              entry.before!
            ),
            div({ fontSize: 84 }, entry.after!)
          ),
          tag(entry.category)
        )
      : tag(entry.category)
  );
}

function priceImage(id: string) {
  const service = data().services.find((item) => item.service === id)!;
  const [plan] = launched(service.plans, data().built);
  const steps = stepsBy(plan, data().built);
  const [first, last] = [steps[0], steps.at(-1)!];
  return frame(
    `${plan.name}, ${plan.region}`,
    headline(`${productName(service)} price history`),
    div(
      { ...condensed, alignItems: 'baseline', gap: 28 },
      div(
        { fontSize: 64, color: colour.soft },
        `${money(first.price, plan.currency)} in ${yearOf(first.date)}`
      ),
      div({ fontSize: 92 }, `${money(last.price, plan.currency)} now`),
      div({ fontSize: 48, color: level[3].plate }, percent(last.price / first.price - 1))
    )
  );
}

function leagueImage() {
  const { plans, cpi, built } = data();
  const { ranked } = league(plans, cpi, '2020-01', built);
  return frame(
    'Since January 2020',
    headline('Which subscriptions have gone up most', 68),
    div(
      { flexDirection: 'column', gap: 10 },
      ...ranked.slice(0, 4).map((rise, index) =>
        div(
          {
            justifyContent: 'space-between',
            fontSize: 30,
            paddingBottom: 8,
            borderBottom: `2px solid ${colour.line}`
          },
          div(
            { gap: 18 },
            div({ color: colour.soft, width: 30 }, String(index + 1)),
            `${rise.plan.serviceName} ${rise.plan.name} (${rise.plan.region})`
          ),
          div({ ...condensed, fontSize: 36 }, percent(rise.rise))
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
      .filter(({ plans }) => launched(plans, data().built).length)
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

const fontFiles = [
  ['Libre Franklin', 'libre-franklin', 400],
  ['Libre Franklin', 'libre-franklin', 700],
  ['Barlow Condensed', 'barlow-condensed', 700]
] as const;

let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined;
let wasm: Promise<void> | undefined;

async function rasterise(svg: string, width?: number) {
  wasm ??= initWasm(readFileSync(resolve('node_modules/@resvg/resvg-wasm/index_bg.wasm')));
  await wasm;
  const fitTo = width ? { mode: 'width' as const, value: width } : undefined;
  return Buffer.from(new Resvg(svg, { fitTo }).render().asPng());
}

export async function drawPage(page: string) {
  if (!cardPages().includes(page)) return undefined;
  fonts ??= fontFiles.map(([name, file, weight]) => ({
    name,
    data: readFileSync(
      resolve(`node_modules/@fontsource/${file}/files/${file}-latin-${weight}-normal.woff`)
    ),
    weight,
    style: 'normal'
  }));
  return rasterise(await satori(pickImage(page) as never, { ...ogSize, fonts }));
}

/** The favicon at a size search engines will take as a logo */
export const drawLogo = () => rasterise(readFileSync(resolve('static/favicon.svg'), 'utf8'), 512);
