import { monthOf, startOf } from '#lib/dates.ts';
import type { Cpi, PlanHistory, Step } from '#lib/data/types.ts';

export const charted = (plans: PlanHistory[]) => plans.filter((plan) => !plan.incomplete);

/** The step in force on a day, or nothing if the plan hadn't launched */
export function stepAt(plan: PlanHistory, date: string): Step | undefined {
  const day = startOf(date);
  return plan.steps.findLast((step) => step.date <= day);
}

/** Steps that have actually happened by a day, so announced rises don't count yet */
export const stepsBy = (plan: PlanHistory, date: string) =>
  plan.steps.filter((step) => step.date <= startOf(date));

export const latestMonth = (cpi: Cpi) => Object.keys(cpi.monthly).sort().at(-1)!;

/** A month CPI can answer for: the one asked, or the latest published if that's later */
export const cpiMonth = (cpi: Cpi, date: string) =>
  monthOf(date) < latestMonth(cpi) ? monthOf(date) : latestMonth(cpi);

/** What a price from one month would be in another, by that country's CPI */
export function inflate(price: number, from: string, cpi: Cpi, to = latestMonth(cpi)) {
  const then = cpi.monthly[monthOf(from)];
  const now = cpi.monthly[cpiMonth(cpi, to)];
  return then && now ? (price * now) / then : undefined;
}

/** The like-for-like plan a plan renamed, if the data says so */
export const predecessor = (plan: PlanHistory, plans: PlanHistory[]) =>
  plan.like_for_like && plan.replaces
    ? plans.find(({ service, id }) => service === plan.service && id === plan.replaces)
    : undefined;

/** A plan's price on a day, following like-for-like renames back in time */
export function priceOn(plan: PlanHistory, date: string, plans: PlanHistory[]): number | undefined {
  const step = stepAt(plan, date);
  if (step) return step.price;
  const before = predecessor(plan, plans);
  return before && priceOn(before, date, plans);
}

/** Plans still on sale, meaning nothing else has replaced them */
export const current = (plans: PlanHistory[]) =>
  charted(plans).filter(
    (plan) => !plans.some((other) => other.service === plan.service && other.replaces === plan.id)
  );

/** Plans on sale on a day: launched by then, and not replaced by anything */
export const onSale = (plans: PlanHistory[], date: string) =>
  current(plans).filter((plan) => stepsBy(plan, date).length);

/** Charted plans that had launched by a day */
export const launched = (plans: PlanHistory[], date: string) =>
  charted(plans).filter((plan) => stepsBy(plan, date).length);

export interface Rise {
  plan: PlanHistory;
  from: number;
  now: number;
  since: string;
  rise: number;
  inflation?: number;
}

/** Every current plan's rise since a day, ranked, plus the ones launched after it */
export function league(plans: PlanHistory[], cpi: Record<string, Cpi>, since: string, on: string) {
  const ranked: Rise[] = [];
  const newer: Rise[] = [];
  for (const plan of onSale(plans, on)) {
    const now = stepsBy(plan, on).at(-1)!.price;
    const then = priceOn(plan, since, plans);
    const start = then === undefined ? plan.steps[0] : { date: startOf(since), price: then };
    const inflated = inflate(start.price, start.date, cpi[plan.region], on);
    const row = {
      plan,
      from: start.price,
      now,
      since: start.date,
      rise: now / start.price - 1,
      inflation: inflated && inflated / start.price - 1
    };
    (then === undefined ? newer : ranked).push(row);
  }
  const order = (a: Rise, b: Rise) => b.rise - a.rise || a.plan.key.localeCompare(b.plan.key);
  return { ranked: ranked.sort(order), newer: newer.sort(order) };
}
