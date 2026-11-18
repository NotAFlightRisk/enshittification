import { data } from '#lib/server/data.ts';
import { latestMonth, league } from '#lib/prices.ts';

const baseline = '2020-01';

export const load = () => {
  const { plans, cpi, built } = data();
  return { ...league(plans, cpi, baseline, built), baseline, cpiTo: latestMonth(cpi.US) };
};
