import { data, stats } from '#lib/server/data.ts';
import { yearOf } from '#lib/dates.ts';

export const load = () => {
  const { services, changes, built } = data();
  const counts = stats();
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
    latest: changes
      .filter(({ date, status }) => date <= built && status !== 'scheduled')
      .slice(0, 8),
    coming: changes.filter(({ status }) => status === 'scheduled').reverse()
  };
};
