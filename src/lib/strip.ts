import { shortDate, yearFraction } from '#lib/dates.ts';
import type { Category, Entry } from '#lib/data/types.ts';

export interface Mark {
  key: string;
  path: string;
  at: number;
  category: Category;
  ink: string;
  hollow: boolean;
  ahead: boolean;
  label: string;
}

// marks closer than this (as a share of the line) get nudged apart so none hide another
const nudge = 0.006;

/** Where each change sits on a year line running from the start of one year to the end of another */
export function marks(changes: Entry[], from: number, to: number, today: string): Mark[] {
  const span = to + 1 - from;
  let last = -1;
  return changes
    .map((change) => ({ change, at: (yearFraction(change.date) - from) / span }))
    .sort((a, b) => a.at - b.at)
    .map(({ change, at }) => {
      const placed = Math.min(1, Math.max(at, last + nudge));
      last = placed;
      return {
        key: change.key,
        path: change.path,
        at: placed * 100,
        category: change.category,
        ink: `var(--${change.category})`,
        hollow: change.status === 'reversed' || change.status === 'test',
        ahead: change.date > today,
        label: `${shortDate(change.date)}: ${change.title}`
      };
    });
}

export const yearsBetween = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/** Where today falls on the same line */
export const nowAt = (from: number, to: number, today: string) =>
  ((yearFraction(today) - from) / (to + 1 - from)) * 100;
