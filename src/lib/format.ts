const currencyFormats = new Map<string, Intl.NumberFormat>();

/** "$9.99", "£95" - pennies only when there are some */
export function money(amount: number, currency: string) {
  const key = `${currency}${Number.isInteger(amount)}`;
  if (!currencyFormats.has(key))
    currencyFormats.set(
      key,
      new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-GB', {
        style: 'currency',
        currency,
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2
      })
    );
  return currencyFormats.get(key)!.format(amount);
}

/** "+31%", "-4%" or "0%" */
export function percent(ratio: number) {
  const value = Math.round(ratio * 100);
  return `${value > 0 ? '+' : ''}${value}%`;
}

export const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`;

/** Joins names the way you'd say them: "a, b and c" */
export function listOf(items: string[]) {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

export const perBilling = { month: 'a month', year: 'a year' } as const;
