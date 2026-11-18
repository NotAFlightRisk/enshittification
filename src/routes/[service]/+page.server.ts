import { error } from '@sveltejs/kit';
import { data, service } from '#lib/server/data.ts';
import { yearOf } from '#lib/dates.ts';
import { launched, onSale, stepsBy } from '#lib/prices.ts';
import { firstYear, latestOf, productName, serviceDescription, serviceTitle } from '#lib/seo.ts';

export const entries = () => data().services.map(({ service }) => ({ service }));

export const load = ({ params }) => {
  const found = service(params.service);
  if (!found) error(404, 'No such service');
  const { built, companies } = data();
  const plans = onSale(found.plans, built).map((plan) => ({
    key: plan.key,
    name: plan.name,
    region: plan.region,
    currency: plan.currency,
    billing: plan.billing,
    launch: plan.steps[0],
    now: stepsBy(plan, built).at(-1)!
  }));
  return {
    service: found,
    company: companies.find(({ id }) => id === found.company)!,
    title: serviceTitle(found),
    description: serviceDescription(found, built),
    latest: latestOf(found.changes, built),
    product: productName(found),
    hasPrices: launched(found.plans, built).length > 0,
    plans,
    today: built,
    from: firstYear(found.changes),
    to: Math.max(yearOf(found.changes[0].date), yearOf(built)),
    years: [...Map.groupBy(found.changes, ({ date }) => yearOf(date))]
  };
};
