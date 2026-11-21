import { describe, expect, it } from 'vitest';
import { board, daysBetween, incidentLog, longestRun } from '#lib/incidents.ts';
import type { Category, Entry, Severity, Status } from '#lib/data/types.ts';

const today = '2026-11-21';

const change = (
  key: string,
  date: string,
  severity: Severity = 1,
  category: Category = 'ads',
  status: Status = 'in-force'
) => ({ key, path: `/tubely/${key}`, date, severity, category, status, title: key }) as Entry;

describe('daysBetween', () => {
  it('counts whole days, a partial date from its first day', () => {
    expect(daysBetween('2026-11-20', today)).toBe(1);
    expect(daysBetween('2026-11', today)).toBe(20);
    expect(daysBetween('2026', '2026-01-01')).toBe(0);
  });

  it("doesn't go below zero for a date ahead", () => {
    expect(daysBetween('2026-12-01', today)).toBe(0);
  });
});

describe('board', () => {
  it('runs each counter from the newest change that resets it', () => {
    const { last, counters } = board(
      [
        change('ad', '2026-11-01', 1),
        change('rise', '2026-10-01', 1, 'price-rise'),
        change('backed-down', '2026-09-01', 5, 'bricked', 'reversed'),
        change('bricked', '2026-08-01', 5, 'bricked')
      ],
      today
    );
    expect(last?.key).toBe('ad');
    expect(counters.map(({ id, change }) => [id, change.key])).toEqual([
      ['price-rise', 'rise'],
      ['ads', 'ad'],
      ['loss', 'bricked']
    ]);
  });

  it('leaves out a counter nothing has reset yet', () => {
    const { counters } = board([change('ad', '2026-11-01')], today);
    expect(counters.map(({ id }) => id)).toEqual(['ads']);
  });
});

describe('longestRun', () => {
  it('finds the longest gap in five years and the change that ended it', () => {
    const run = longestRun(
      [
        change('latest', '2026-03-01'),
        change('ended', '2026-01-31'),
        change('started', '2025-12-01'),
        change('ancient', '2019-01-01')
      ],
      today
    );
    expect(run).toMatchObject({ days: 61, ended: { key: 'ended' } });
  });

  it('has no record with fewer than two changes', () => {
    expect(longestRun([change('alone', '2026-01-01')], today)).toEqual({ days: 0 });
  });
});

describe('incidentLog', () => {
  const happened = [
    change('ads-1', '2026-10-20', 1),
    change('rise', '2026-10-18', 2, 'price-rise'),
    change('ads-2', '2026-10-10', 1),
    change('bad', '2026-10-05', 3),
    change('worse', '2026-10-02', 5, 'bricked'),
    change('old', '2025-11-30', 4)
  ];

  it('names serious changes, worst first, and counts the rest by kind', () => {
    const [october] = incidentLog(happened, today);
    expect(october.month).toBe('2026-10');
    expect(october.serious.map(({ key }) => key)).toEqual(['worse', 'bad']);
    expect(october.minor).toEqual([
      { category: 'ads', count: 2, path: '/category/ads' },
      { category: 'price-rise', count: 1, path: '/tubely/rise' }
    ]);
  });

  it('caps how many it names and how many months it shows', () => {
    const [october] = incidentLog(happened, today, 6, 1);
    expect(october).toMatchObject({ serious: [{ key: 'worse' }], more: 1 });
    expect(incidentLog(happened, today, 1)).toHaveLength(1);
  });

  it('only looks back a year', () => {
    expect(incidentLog(happened, today).map(({ month }) => month)).toEqual(['2026-10']);
  });
});
