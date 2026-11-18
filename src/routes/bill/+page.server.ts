import { data } from '#lib/server/data.ts';
import { yearOf } from '#lib/dates.ts';
import { current, inflate, latestMonth, priceOn, stepsBy } from '#lib/prices.ts';

const firstYear = 2010;

export const load = () => {
  const { plans, cpi, built } = data();
  const years = Array.from({ length: yearOf(built) - firstYear }, (_, index) => firstYear + index);
  return {
    years,
    cpiTo: latestMonth(cpi.US),
    plans: current(plans).map((plan) => ({
      key: plan.key,
      service: plan.serviceName,
      name: plan.name,
      region: plan.region,
      currency: plan.currency,
      billing: plan.billing,
      now: stepsBy(plan, built).at(-1)!.price,
      then: Object.fromEntries(
        years.map((year) => {
          const price = priceOn(plan, `${year}-01-01`, plans);
          const kept = price && inflate(price, `${year}-01`, cpi[plan.region], built);
          return [year, price ? { price, kept } : null];
        })
      )
    }))
  };
};
