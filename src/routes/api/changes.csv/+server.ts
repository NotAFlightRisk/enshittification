import { data } from '#lib/server/data.ts';
import { absolute } from '#lib/site.ts';

export const prerender = true;

const columns = [
  'service',
  'id',
  'date',
  'date_kind',
  'effective',
  'category',
  'status',
  'title',
  'what_changed',
  'user_impact',
  'regions',
  'url',
  'sources'
] as const;

const cell = (value: unknown) => {
  const text = value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const GET = () => {
  const rows = data().changes.map((change) =>
    [
      change.service,
      change.id,
      change.date,
      change.date_kind,
      change.effective,
      change.category,
      change.status,
      change.title,
      change.what_changed,
      change.user_impact,
      change.regions?.join(' '),
      absolute(change.path),
      change.sources.map(({ url }) => url).join(' ')
    ].map(cell)
  );
  return new Response([columns.join(','), ...rows.map((row) => row.join(','))].join('\n') + '\n', {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' }
  });
};
