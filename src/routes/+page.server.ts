import { data, stats, wall } from '#lib/server/data.ts';
import { isHollow, levelOf } from '#lib/data/types.ts';
import { happenedBy } from '#lib/seo.ts';

export const load = () => {
  const { changes, built } = data();
  const happened = happenedBy(changes, built);
  const serious = happened
    .filter(({ severity, status }) => levelOf(severity) === 'danger' && !isHollow(status))
    .slice(0, 3);
  return {
    counts: stats(),
    wall: wall(10),
    serious,
    latest: happened.filter((change) => !serious.includes(change)).slice(0, 6),
    coming: changes.filter(({ status }) => status === 'scheduled').reverse()
  };
};
