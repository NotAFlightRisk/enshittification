import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataDir } from '#lib/data/load.ts';
import { today } from '#lib/dates.ts';
import type { Cpi } from '#lib/data/types.ts';

// US CPI-U from BLS (public domain) and UK CPI from ONS (Open Government Licence)

const first = 2005;
const headers = { 'User-Agent': 'enshittification.peng.ly CPI refresh' };
const monthNames = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ');

async function json(url: string, body?: object) {
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

async function us(): Promise<Cpi> {
  const monthly: Record<string, number> = {};
  // the keyless API takes ten years per call, and only as a POST - a GET ignores the years
  for (let start = first; start <= new Date().getFullYear(); start += 10) {
    const body = await json('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
      seriesid: ['CUUR0000SA0'],
      startyear: String(start),
      endyear: String(start + 9)
    });
    if (body.status !== 'REQUEST_SUCCEEDED') throw new Error(`BLS said ${body.message}`);
    for (const { year, period, value } of body.Results.series[0].data)
      if (/^M(0[1-9]|1[0-2])$/.test(period)) monthly[`${year}-${period.slice(1)}`] = Number(value);
  }
  return {
    region: 'US',
    series: 'CUUR0000SA0',
    name: 'CPI-U, all items, US city average, not seasonally adjusted',
    source: 'https://data.bls.gov/timeseries/CUUR0000SA0',
    licence: 'Public domain, US Bureau of Labor Statistics',
    updated: today(),
    monthly: sorted(monthly)
  };
}

async function uk(): Promise<Cpi> {
  const body = await json(
    'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23/data'
  );
  const monthly: Record<string, number> = {};
  for (const { year, date, value } of body.months) {
    const month = monthNames.indexOf(date.slice(5)) + 1;
    if (Number(year) >= first && month)
      monthly[`${year}-${String(month).padStart(2, '0')}`] = Number(value);
  }
  return {
    region: 'UK',
    series: 'D7BT',
    name: 'CPI index, all items, 2015=100',
    source: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23',
    licence: 'Open Government Licence v3.0, Office for National Statistics',
    updated: today(),
    monthly: sorted(monthly)
  };
}

const sorted = (monthly: Record<string, number>) =>
  Object.fromEntries(Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)));

for (const series of await Promise.all([us(), uk()])) {
  const months = Object.keys(series.monthly);
  if (months.length < 12 * 15)
    throw new Error(`${series.region} CPI looks short: ${months.length} months`);
  writeFileSync(
    join(dataDir, 'cpi', `${series.region.toLowerCase()}.json`),
    `${JSON.stringify(series, null, 2)}\n`
  );
  console.log(`${series.region}: ${months[0]} to ${months.at(-1)}, ${months.length} months`);
}
