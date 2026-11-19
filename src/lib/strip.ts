import { shortDate, yearFraction } from '#lib/dates.ts';
import {
  levelOf,
  levels,
  type Category,
  type Entry,
  type Severity,
  type Status
} from '#lib/data/types.ts';

export interface Mark {
  key: string;
  path: string;
  at: number;
  category: Category;
  severity: Severity;
  status: Status;
  label: string;
  lane: number;
  narrowLane: number;
}

// how close two signs can sit, as a share of the line, before one goes up a post
const room = { wide: 0.04, narrow: 0.075 };

/** The widest a sign can be, as a share of the line, and still clear its neighbour on the same post */
export const fit = { wide: room.wide * 0.9, narrow: room.narrow * 0.9 };

/** Which post height each sign takes so it doesn't cover its neighbour */
function lanes(positions: number[], gap: number) {
  const ends: number[] = [];
  return positions.map((at) => {
    const free = ends.findIndex((end) => at - end >= gap);
    const lane = free === -1 ? ends.length : free;
    ends[lane] = at;
    return lane;
  });
}

/** Where each change sits on a year line running from the start of one year to the end of another */
export function marks(changes: Entry[], from: number, to: number): Mark[] {
  const span = to + 1 - from;
  const placed = changes
    .map((change) => ({ change, at: Math.min(1, (yearFraction(change.date) - from) / span) }))
    .sort((a, b) => a.at - b.at);
  const positions = placed.map(({ at }) => at);
  const wide = lanes(positions, room.wide);
  const narrow = lanes(positions, room.narrow);
  return placed.map(({ change, at }, index) => ({
    key: change.key,
    path: change.path,
    at: at * 100,
    category: change.category,
    severity: change.severity,
    status: change.status,
    label: `${levels[levelOf(change.severity)].name}, ${shortDate(change.date)}: ${change.title}`,
    lane: wide[index],
    narrowLane: narrow[index]
  }));
}

/** How many posts high a strip needs to be */
export const height = (placed: Mark[]) => ({
  wide: Math.max(0, ...placed.map(({ lane }) => lane)) + 1,
  narrow: Math.max(0, ...placed.map(({ narrowLane }) => narrowLane)) + 1
});

export const yearsBetween = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/** Where today falls on the same line */
export const nowAt = (from: number, to: number, today: string) =>
  ((yearFraction(today) - from) / (to + 1 - from)) * 100;
