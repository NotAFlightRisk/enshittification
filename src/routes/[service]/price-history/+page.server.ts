import { error } from '@sveltejs/kit';
import { priceChart } from '#lib/chart.ts';
import { data, service } from '#lib/server/data.ts';
import { charted, stepsBy } from '#lib/prices.ts';
import { productName } from '#lib/seo.ts';

export const entries = () =>
  data()
    .services.filter(({ plans }) => charted(plans).length)
    .map(({ service }) => ({ service }));

export const load = ({ params }) => {
  const found = service(params.service);
  if (!found || !charted(found.plans).length) error(404, 'No prices for that service');
  const { built, cpi } = data();
  const plans = charted(found.plans).map((plan) => ({
    ...plan,
    steps: stepsBy(plan, built),
    chart: priceChart(plan, cpi[plan.region], built)
  }));
  return {
    service: found,
    product: productName(found),
    plans,
    incomplete: found.plans.filter(({ incomplete }) => incomplete),
    regions: [...new Set(plans.map(({ region }) => region))].sort().reverse()
  };
};
