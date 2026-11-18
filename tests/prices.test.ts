import { describe, expect, it } from 'vitest';
import { inflate, league, onSale, priceOn } from '#lib/prices.ts';
import type { Cpi, PlanHistory } from '#lib/data/types.ts';

const cpi = (monthly: Record<string, number>): Cpi => ({
  region: 'US',
  series: 'test',
  name: 'test',
  source: '',
  licence: '',
  updated: '2026-11-01',
  monthly
});
const us = cpi({ '2018-01': 100, '2020-01': 100, '2023-01': 110, '2026-10': 120 });

const plan = (
  id: string,
  steps: [string, number][],
  extra: Partial<PlanHistory> = {}
): PlanHistory => ({
  id,
  name: id,
  region: 'US',
  currency: 'USD',
  billing: 'month',
  since: steps[0][0],
  price: steps[0][1],
  source: { url: '', publisher: '', kind: 'press', published: '', archive: '', quote: '' },
  service: 'tubely',
  serviceName: 'Tubely',
  key: `tubely/${id}`,
  steps: steps.map(([date, price]) => ({ date, price })),
  ...extra
});

describe('prices', () => {
  it('keeps a price up with inflation, to the latest month there is', () => {
    expect(inflate(10, '2020-01-15', us, '2027-06-01')).toBeCloseTo(12);
  });

  it('follows a like-for-like rename back in time', () => {
    const red = plan('red', [['2015-10-01', 9.99]]);
    const premium = plan('premium', [['2018-06-01', 11.99]], {
      replaces: 'red',
      like_for_like: true
    });
    expect(priceOn(premium, '2017-01-01', [red, premium])).toBe(9.99);
  });

  it("doesn't borrow a price from a plan that only got replaced", () => {
    const old = plan('old', [['2015-10-01', 9.99]]);
    const bundle = plan('bundle', [['2021-06-01', 14.99]], { replaces: 'old' });
    expect(priceOn(bundle, '2020-01-01', [old, bundle])).toBeUndefined();
  });

  it('keeps selling a plan until its replacement has launched', () => {
    const old = plan('old', [['2018-01-01', 10]]);
    const next = plan('next', [['2027-01-01', 12]], { replaces: 'old', like_for_like: true });
    expect(onSale([old, next], '2026-11-18').map(({ id }) => id)).toEqual(['old']);
    expect(onSale([old, next], '2027-02-01').map(({ id }) => id)).toEqual(['next']);
  });

  it('ranks the plans from 2020 and lists the newer ones apart', () => {
    const steady = plan('steady', [
      ['2018-01-01', 10],
      ['2023-01-01', 11]
    ]);
    const steep = plan('steep', [
      ['2018-01-01', 10],
      ['2023-01-01', 15]
    ]);
    const fresh = plan('fresh', [
      ['2022-01-01', 5],
      ['2024-01-01', 6]
    ]);
    const { ranked, newer } = league(
      [steady, steep, fresh],
      { US: us, UK: us },
      '2020-01',
      '2026-11-18'
    );
    expect(ranked.map(({ plan }) => plan.id)).toEqual(['steep', 'steady']);
    expect(ranked[0].rise).toBeCloseTo(0.5);
    expect(ranked[0].inflation).toBeCloseTo(0.2);
    expect(newer.map(({ plan }) => plan.id)).toEqual(['fresh']);
  });
});
