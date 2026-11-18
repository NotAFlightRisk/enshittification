import { data, stats } from '#lib/server/data.ts';
import { yearOf } from '#lib/dates.ts';
import { happenedBy } from '#lib/seo.ts';

export const load = () => {
  const { services, changes, built } = data();
  const counts = stats();
  const happened = happenedBy(changes, built);
  const serious = happened.filter(({ severity }) => severity === 3).slice(0, 3);
  return {
    counts,
    today: built,
    from: counts.first,
    to: Math.max(counts.last, yearOf(built)),
    rows: services.map(({ service, name, changes }) => ({
      id: service,
      name,
      path: `/${service}`,
      changes
    })),
    serious,
    latest: happened.filter((change) => !serious.includes(change)).slice(0, 6),
    coming: changes.filter(({ status }) => status === 'scheduled').reverse()
  };
};
