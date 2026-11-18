import { data, stats } from '#lib/server/data.ts';
import { shortDate } from '#lib/dates.ts';
import { absolute, site } from '#lib/site.ts';

export const prerender = true;

// A plain summary for AI assistants and answer engines, following https://llmstxt.org
export const GET = () => {
  const { services } = data();
  const counts = stats();
  const link = (title: string, path: string, note: string) =>
    `- [${title}](${absolute(path)}): ${note}`;
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${counts.changes} changes at ${counts.services} services from ${counts.first} to ${counts.last}, backed by ${counts.sources} sources. Each change page opens with the date and what changed, then the sources, each with a quote and an archived copy. Data under CC BY 4.0, last updated ${counts.updated}.`,
    '',
    ...services.flatMap((service) => [
      `## ${service.name}`,
      '',
      link(
        `${service.name}, every change`,
        `/${service.service}`,
        `${service.changes.length} changes, newest first`
      ),
      ...service.changes.map((change) => link(change.title, change.path, shortDate(change.date))),
      ''
    ]),
    '## Data',
    '',
    link(
      'Every change as JSON',
      '/api/changes.json',
      'all entries with their sources, plans and prices'
    ),
    link('Every change as CSV', '/api/changes.csv', 'one row per change'),
    link(
      'Price league',
      '/prices',
      'subscription plans ranked by their rise since January 2020, with inflation'
    ),
    link('How entries are made', '/about', 'sourcing rules and the checks every entry passes'),
    '',
    '## Optional',
    '',
    `- [Source and data on GitHub](${site.repo}): corrections by issue or pull request`,
    ''
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
