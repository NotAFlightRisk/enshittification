import { describe, expect, it } from 'vitest';
import { rankServices, worstOf } from '#lib/seo.ts';
import { marks } from '#lib/strip.ts';
import type { Entry, Service, Severity, Status } from '#lib/data/types.ts';

const change = (key: string, date: string, severity: Severity, status: Status = 'in-force') =>
  ({ key, path: `/tubely/${key}`, date, severity, status, category: 'ads', title: key }) as Entry;

describe('worstOf', () => {
  it('picks the most serious change, the newest of a tie', () => {
    const changes = [
      change('newer', '2024-05-01', 2),
      change('older', '2022-05-01', 2),
      change('mild', '2021-05-01', 1)
    ];
    expect(worstOf(changes, '2026-01-01')?.key).toBe('newer');
  });

  it("skips changes that haven't happened or didn't stick", () => {
    const changes = [
      change('announced', '2027-01-01', 3, 'scheduled'),
      change('backed-down', '2025-01-01', 3, 'reversed'),
      change('tested', '2024-01-01', 3, 'test'),
      change('real', '2023-01-01', 2)
    ];
    expect(worstOf(changes, '2026-01-01')?.key).toBe('real');
    expect(worstOf(changes.slice(0, 3), '2026-01-01')).toBeUndefined();
  });
});

describe('rankServices', () => {
  const service = (name: string, changes: Entry[]) => ({ service: name, changes }) as Service;
  const ranked = (services: Service[]) =>
    rankServices(services, '2026-01-01').map(({ service }) => service);

  it('puts one 5 above fifteen price rises', () => {
    const rises = Array.from({ length: 15 }, (_, day) =>
      change(`rise-${day}`, `2020-01-${String(day + 1).padStart(2, '0')}`, 1)
    );
    const services = [service('pricey', rises), service('bricky', [change('dead', '2021-01', 5)])];
    expect(ranked(services)).toEqual(['bricky', 'pricey']);
  });

  it("doesn't count changes that haven't happened or didn't stick", () => {
    const services = [
      service('threatened', [
        change('announced', '2027-01-01', 5, 'scheduled'),
        change('backed-down', '2025-01-01', 5, 'reversed'),
        change('tested', '2024-01-01', 5, 'test')
      ]),
      service('real', [change('ads', '2023-01-01', 2)])
    ];
    expect(ranked(services)).toEqual(['real', 'threatened']);
  });
});

describe('marks', () => {
  it('keeps signs that are far apart on the bottom post', () => {
    const placed = marks([change('a', '2016-01', 1), change('b', '2020-01', 1)], 2016, 2025);
    expect(placed.map(({ lane }) => lane)).toEqual([0, 0]);
  });

  it('stacks close signs as high as it takes', () => {
    const placed = marks(
      ['01', '02', '03', '04'].map((day) => change(day, `2020-06-${day}`, 1)),
      2016,
      2025
    );
    expect(placed.map(({ lane }) => lane)).toEqual([0, 1, 2, 3]);
    expect(placed.map(({ narrowLane }) => narrowLane)).toEqual([0, 1, 2, 3]);
  });
});
