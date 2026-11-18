// dates in the data are YYYY, YYYY-MM or YYYY-MM-DD, as precise as the sources allow

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const parts = (date: string) => date.split('-').map(Number) as [number, number?, number?];

export function isPartialDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(value)) return false;
  const [year, month = 1, day = 1] = parts(value);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const isFullDate = (value: unknown): value is string =>
  isPartialDate(value) && value.length === 10;

export const yearOf = (date: string) => parts(date)[0];

/** The first day a partial date could mean, which is when a price change counts from */
export function startOf(date: string) {
  const [year, month = 1, day = 1] = parts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Where a date sits on a year line, with a bare year in the middle of it */
export function yearFraction(date: string) {
  const [year, month, day] = parts(date);
  if (!month) return year + 0.5;
  const start = Date.UTC(year, 0, 1);
  const length = Date.UTC(year + 1, 0, 1) - start;
  const at = day ? Date.UTC(year, month - 1, day) : Date.UTC(year, month - 1, 15);
  return year + (at - start) / length;
}

/** "10 November 2021", "November 2021" or "2021" */
export function formatDate(date: string) {
  const [year, month, day] = parts(date);
  if (!month) return String(year);
  return [day, months[month - 1], year].filter(Boolean).join(' ');
}

/** Short form for dense lists: "10 Nov 2021", "Nov 2021" or "2021" */
export function shortDate(date: string) {
  const [year, month, day] = parts(date);
  if (!month) return String(year);
  return [day, months[month - 1].slice(0, 3), year].filter(Boolean).join(' ');
}

export const monthOf = (date: string) => startOf(date).slice(0, 7);

export const today = () => new Date().toISOString().slice(0, 10);
