import { monthOf, startOf, yearFraction, yearOf } from '#lib/dates.ts';
import { inflate, latestMonth, stepsBy } from '#lib/prices.ts';
import type { Cpi, PlanHistory } from '#lib/data/types.ts';

export interface PricePoint {
  x: number;
  y: number;
  price: number;
  date: string;
  change?: string;
}

/** A step chart of a plan's price, with its launch price kept up with inflation behind it */
export function priceChart(plan: PlanHistory, cpi: Cpi, today: string) {
  const steps = stepsBy(plan, today);
  const start = yearFraction(steps[0].date);
  const end = yearFraction(today);
  const months: string[] = [];
  for (let month = monthOf(steps[0].date); month <= latestMonth(cpi);) {
    months.push(month);
    const [year, number] = month.split('-').map(Number);
    month = number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
  }
  const kept = months
    .map((month) => ({ month, price: inflate(steps[0].price, steps[0].date, cpi, month) }))
    .filter((point): point is { month: string; price: number } => point.price !== undefined);

  const top =
    Math.max(...steps.map(({ price }) => price), ...kept.map(({ price }) => price)) * 1.15;
  const x = (date: string) => ((yearFraction(date) - start) / (end - start || 1)) * 100;
  const y = (price: number) => 100 - (price / top) * 100;

  const points: PricePoint[] = steps.map((step) => ({
    ...step,
    x: x(step.date),
    y: y(step.price)
  }));
  const line = points
    .map((point, index) => (index ? `H ${point.x} V ${point.y}` : `M ${point.x} ${point.y}`))
    .join(' ')
    .concat(' H 100');
  const inflation = kept.map(({ month, price }) => `${x(startOf(month))},${y(price)}`).join(' ');
  const years = Array.from({ length: yearOf(today) - Math.ceil(start) + 1 }, (_, index) => {
    const year = Math.ceil(start) + index;
    return { year, x: x(`${year}-01-01`) };
  }).filter(({ x }) => x >= 0 && x <= 100);

  return { points, line, inflation, years, top };
}
