import { monthOf, startOf, yearOf } from '#lib/dates.ts';
import { isHollow, levelOf, type Category, type Entry } from '#lib/data/types.ts';

const fields = [
  'key',
  'path',
  'title',
  'serviceName',
  'date',
  'category',
  'severity',
  'status'
] as const;

/** Just enough of a change to name it and link to it */
export type Brief = Pick<Entry, (typeof fields)[number]>;

const brief = (change: Entry) =>
  Object.fromEntries(fields.map((field) => [field, change[field]])) as Brief;

export interface Tally {
  category: Category;
  count: number;
  path: string;
}

export interface LogMonth {
  month: string;
  serious: Brief[];
  more: number;
  minor: Tally[];
}

const isSerious = ({ severity }: Entry) => levelOf(severity) !== 'caution';

/** What resets each of the board's smaller counters */
const resets = {
  'price-rise': ({ category }: Entry) => category === 'price-rise',
  ads: ({ category }: Entry) => category === 'ads',
  loss: ({ severity, status }: Entry) => levelOf(severity) === 'danger' && !isHollow(status)
};

export type Reset = keyof typeof resets;

const day = 86_400_000;

/** Whole days from one date to another, a partial date counting from its first day */
export const daysBetween = (from: string, to: string) =>
  Math.max(0, Math.floor((Date.parse(startOf(to)) - Date.parse(startOf(from))) / day));

const yearsBefore = (date: string, years: number) => `${yearOf(date) - years}${date.slice(4)}`;

/** The longest gap between changes in the last five years, and the change that ended it */
export function longestRun(happened: Entry[], today: string) {
  const since = yearsBefore(today, 5);
  const oldestFirst = happened.filter(({ date }) => startOf(date) > since).toReversed();
  let best: { days: number; ended?: Brief } = { days: 0 };
  for (const [index, change] of oldestFirst.entries()) {
    const days = index ? daysBetween(oldestFirst[index - 1].date, change.date) : 0;
    if (days > best.days) best = { days, ended: brief(change) };
  }
  return best;
}

/** The changes each counter on the board runs from, given changes that happened, newest first */
export function board(happened: Entry[], today: string) {
  const newest = (test: (change: Entry) => boolean) => {
    const found = happened.find(test);
    return found && brief(found);
  };
  return {
    last: newest(() => true),
    counters: (Object.keys(resets) as Reset[]).flatMap((id) => {
      const change = newest(resets[id]);
      return change ? [{ id, change }] : [];
    }),
    best: longestRun(happened, today)
  };
}

export type Board = ReturnType<typeof board>;

/** Minor changes counted by kind, linking to the change itself when there's only one */
const tallies = (changes: Entry[]): Tally[] =>
  [...Map.groupBy(changes, ({ category }) => category)]
    .map(([category, list]) => ({
      category,
      count: list.length,
      path: list.length === 1 ? list[0].path : `/category/${category}`
    }))
    .sort((a, b) => b.count - a.count);

/** The latest months with changes in the past year, the serious ones named and the rest counted */
export function incidentLog(happened: Entry[], today: string, months = 6, named = 3): LogMonth[] {
  const since = monthOf(yearsBefore(today, 1));
  const recent = happened.filter(({ date }) => monthOf(date) > since);
  return [...Map.groupBy(recent, ({ date }) => monthOf(date))]
    .slice(0, months)
    .map(([month, list]) => {
      const serious = list.filter(isSerious).toSorted((a, b) => b.severity - a.severity);
      return {
        month,
        serious: serious.slice(0, named).map(brief),
        more: Math.max(0, serious.length - named),
        minor: tallies(list.filter((change) => !isSerious(change)))
      };
    });
}
