import { data, years } from '#lib/server/data.ts';
import { categories } from '#lib/data/types.ts';
import { launched } from '#lib/prices.ts';
import { changeIndexed, listIndexed } from '#lib/seo.ts';
import { yearOf } from '#lib/dates.ts';
import { absolute } from '#lib/site.ts';

export const prerender = true;

const latest = (dates: string[]) => dates.reduce((top, date) => (date > top ? date : top), '');

// only pages that are indexed, with lastmod where there's a real date behind it
export const GET = () => {
  const { services, changes, companies } = data();
  const updated = (list: typeof changes) => latest(list.map(({ updated }) => updated));
  const pages = [
    { path: '/', modified: updated(changes) },
    ...['/prices', '/bill', '/latest', '/data', '/about', '/corrections'].map((path) => ({ path })),
    ...services.flatMap((service) => [
      { path: `/${service.service}`, modified: updated(service.changes) },
      ...(launched(service.plans, data().built).length
        ? [{ path: `/${service.service}/price-history` }]
        : [])
    ]),
    ...changes.filter(changeIndexed).map(({ path, updated }) => ({ path, modified: updated })),
    ...Object.keys(categories)
      .map((category) => ({
        category,
        list: changes.filter((change) => change.category === category)
      }))
      .filter(({ list }) => listIndexed(list))
      .map(({ category, list }) => ({ path: `/category/${category}`, modified: updated(list) })),
    ...companies
      .map(({ id }) => ({
        id,
        list: changes.filter(
          ({ service }) => services.find((item) => item.service === service)?.company === id
        )
      }))
      .filter(({ list }) => listIndexed(list))
      .map(({ id, list }) => ({ path: `/company/${id}`, modified: updated(list) })),
    ...years()
      .map((year) => ({ year, list: changes.filter(({ date }) => yearOf(date) === year) }))
      .filter(({ list }) => listIndexed(list))
      .map(({ year, list }) => ({ path: `/year/${year}`, modified: updated(list) }))
  ];
  const urls = pages
    .map(
      ({ path, modified }: { path: string; modified?: string }) =>
        `<url><loc>${absolute(path)}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}</url>`
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
};
