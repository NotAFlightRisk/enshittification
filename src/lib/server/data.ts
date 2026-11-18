import { dataset } from '#lib/data/build.ts';
import { yearFraction, yearOf } from '#lib/dates.ts';
import type { Dataset, Entry } from '#lib/data/types.ts';

let cached: Dataset | undefined;
export const data = () => (cached ??= dataset());

export const service = (id: string) => data().services.find((item) => item.service === id);

export const years = () => [...new Set(data().changes.map(({ date }) => yearOf(date)))].sort();

export function stats() {
  const { changes, services } = data();
  return {
    changes: changes.length,
    services: services.length,
    sources: changes.reduce((total, { sources }) => total + sources.length, 0),
    first: Math.min(...years()),
    last: Math.max(...years()),
    updated: changes.reduce((latest, { updated }) => (updated > latest ? updated : latest), '')
  };
}

/** What a change page needs to know about its neighbours */
export function around(entry: Entry) {
  const { changes } = data();
  const own = changes.filter(({ service }) => service === entry.service);
  const at = own.findIndex(({ key }) => key === entry.key);
  const distance = (other: Entry) => Math.abs(yearFraction(other.date) - yearFraction(entry.date));
  const elsewhere = changes
    .filter((other) => other.service !== entry.service && other.category === entry.category)
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, 3);
  const related = (entry.related ?? [])
    .map((key) => changes.find((other) => other.key === key))
    .filter((other) => other !== undefined);
  return { newer: own[at - 1], older: own[at + 1], elsewhere, related };
}
