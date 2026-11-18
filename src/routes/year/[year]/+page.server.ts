import { error } from '@sveltejs/kit';
import { data, years } from '#lib/server/data.ts';
import { yearOf } from '#lib/dates.ts';
import { listIndexed } from '#lib/seo.ts';
import { plural } from '#lib/format.ts';

export const entries = () => years().map((year) => ({ year: String(year) }));

export const load = ({ params }) => {
  const year = Number(params.year);
  const changes = data().changes.filter(({ date }) => yearOf(date) === year);
  if (!changes.length) error(404, 'Nothing logged for that year');
  const services = new Set(changes.map(({ service }) => service)).size;
  const all = years();
  const at = all.indexOf(year);
  return {
    year,
    changes,
    title: `What got worse in ${year}: ${plural(changes.length, 'change')} at ${plural(services, 'service')}`,
    description: `Every price rise, new ad, paywall and removed feature logged for ${year}, newest first, each with its date and sources.`,
    indexed: listIndexed(changes),
    previous: all[at - 1],
    next: all[at + 1]
  };
};
