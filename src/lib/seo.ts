import { firstSentence } from '#lib/data/check.ts';
import { formatDate, shortDate, yearOf } from '#lib/dates.ts';
import { listOf, plural } from '#lib/format.ts';
import {
  isHollow,
  type Category,
  type Entry,
  type PlanHistory,
  type Service
} from '#lib/data/types.ts';

// the words people search with, per kind of change
export const nouns: Record<Category, [string, string]> = {
  'price-rise': ['price rise', 'price rises'],
  ads: ['ad change', 'ad changes'],
  paywall: ['paywall', 'paywalls'],
  'removed-feature': ['removed feature', 'removed features'],
  'api-restriction': ['API restriction', 'API restrictions'],
  tracking: ['tracking change', 'tracking changes'],
  'lock-out': ['lock-out', 'lock-outs'],
  bricked: ['bricked device', 'bricked devices'],
  ai: ['AI feature pushed in', 'AI features pushed in']
};

/** The kinds of change a list has most of, as you'd say them */
export function topKinds(changes: Entry[], count = 3) {
  const tally = Map.groupBy(changes, ({ category }) => category);
  return [...tally.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, count)
    .map(([category]) => nouns[category][0]);
}

export const firstYear = (changes: Entry[]) => Math.min(...changes.map(({ date }) => yearOf(date)));

export function serviceTitle(service: Service) {
  return `${service.name}: every ${listOf(topKinds(service.changes))} since ${firstYear(service.changes)}, dated`;
}

/** Changes in force or tried by a day, leaving out ones only announced */
export const happenedBy = (changes: Entry[], today: string) =>
  changes.filter(({ date, status }) => date <= today && status !== 'scheduled');

/** The newest change that has actually happened, so a scheduled one doesn't count as the latest */
const latestOf = (changes: Entry[], today: string) => happenedBy(changes, today)[0] ?? changes[0];

/** The most serious change that happened and stuck, the newest if there's a tie */
export function worstOf(changes: Entry[], today: string) {
  const stuck = happenedBy(changes, today).filter(({ status }) => !isHollow(status));
  return stuck.reduce(
    (worst, change) => (change.severity > worst.severity ? change : worst),
    stuck[0] ?? changes[0]
  );
}

export function serviceDescription(service: Service, today: string) {
  const latest = latestOf(service.changes, today);
  return `${plural(service.changes.length, 'change')} at ${service.name} since ${firstYear(service.changes)}, each dated and sourced. The latest, ${shortDate(latest.date)}: ${latest.title}.`;
}

/** "November 2021" for a full date, which is plenty for a page title */
const titleDate = (date: string) => formatDate(date.length === 10 ? date.slice(0, 7) : date);

export function changeTitle(entry: Entry) {
  return entry.question
    ? `${entry.question} ${titleDate(entry.date)}`
    : `${entry.title}, ${titleDate(entry.date)}`;
}

export const changeDescription = (entry: Entry) => firstSentence(entry.what_changed);

/** Thin pages stay out of the index until there's more on them */
export const changeIndexed = (entry: Entry) => Boolean(entry.question) || entry.sources.length > 1;
export const listIndexed = (changes: Entry[]) => changes.length >= 5;

/** "YouTube Premium" for plans called "YouTube Premium" and "YouTube Premium Family" */
export function productName(service: Service | { name: string; plans: PlanHistory[] }) {
  const names = service.plans.map(({ name }) => name.split(' '));
  if (!names.length) return service.name;
  const common: string[] = [];
  const shortest = Math.min(...names.map((words) => words.length));
  for (let index = 0; index < shortest; index++) {
    if (!names.every((words) => words[index] === names[0][index])) break;
    common.push(names[0][index]);
  }
  const product = common.join(' ');
  if (!product) return service.name;
  return product.startsWith(service.name) ? product : `${service.name} ${product}`;
}
