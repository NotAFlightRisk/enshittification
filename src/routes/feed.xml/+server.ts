import { data } from '#lib/server/data.ts';
import { formatDate } from '#lib/dates.ts';
import { categories } from '#lib/data/types.ts';
import { absolute, site } from '#lib/site.ts';

export const prerender = true;

const limit = 50;
const escape = (text: string) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);

// newest additions to the index first, which is what a feed reader wants to hear about
export const GET = () => {
  const { changes, built } = data();
  const entries = changes
    .toSorted((a, b) => b.added.localeCompare(a.added) || b.date.localeCompare(a.date))
    .slice(0, limit);
  const items = entries.map((entry) => {
    const sources = entry.sources
      .map(({ url, publisher }) => `<li><a href="${escape(url)}">${escape(publisher)}</a></li>`)
      .join('');
    const content = `<p>${escape(entry.what_changed)}</p><p>${escape(entry.user_impact)}</p><ul>${sources}</ul>`;
    return [
      '<entry>',
      `<title>${escape(`${entry.serviceName}: ${entry.title}`)}</title>`,
      `<link href="${absolute(entry.path)}"/>`,
      `<id>${absolute(entry.path)}</id>`,
      `<updated>${entry.updated}T00:00:00Z</updated>`,
      `<published>${entry.added}T00:00:00Z</published>`,
      `<category term="${entry.category}" label="${categories[entry.category]}"/>`,
      `<summary>${escape(`${formatDate(entry.date)}: ${entry.title}`)}</summary>`,
      `<content type="html">${escape(content)}</content>`,
      '</entry>'
    ].join('');
  });
  const feed = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `<title>${site.name}</title>`,
    `<subtitle>${escape(site.description)}</subtitle>`,
    `<link href="${absolute('/feed.xml')}" rel="self"/>`,
    `<link href="${absolute('/')}"/>`,
    `<id>${absolute('/')}</id>`,
    `<updated>${entries[0]?.updated ?? built}T00:00:00Z</updated>`,
    `<author><name>${site.name}</name><uri>${site.url}</uri></author>`,
    `<icon>${absolute('/favicon.svg')}</icon>`,
    ...items,
    '</feed>'
  ];
  return new Response(feed.join('\n'), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' }
  });
};
