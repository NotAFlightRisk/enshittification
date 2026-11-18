import { data, stats } from '#lib/server/data.ts';

export const load = () => {
  const { cpi } = data();
  return {
    counts: stats(),
    cpi: Object.values(cpi).map(({ region, name, source, licence, updated }) => ({
      region,
      name,
      source,
      licence,
      updated
    }))
  };
};
