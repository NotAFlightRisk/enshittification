import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { check } from '#lib/data/check.ts';
import { parseYaml } from '#lib/data/load.ts';

const dir = 'tests/fixtures/good';
const service = readFileSync(`${dir}/services/tubely.yaml`, 'utf8');
const companies = parseYaml(readFileSync(`${dir}/companies.yaml`, 'utf8'), 'companies.yaml');

/** Checks the good fixture with one edit made to it */
const problems = (edit: (text: string) => string = (text) => text, name = 'tubely') =>
  check({ companies, services: [parseYaml(edit(service), `${name}.yaml`)] }).map(
    ({ path, message }) => `${path} ${message}`
  );

describe('check', () => {
  it('passes the good fixture', () => {
    expect(problems()).toEqual([]);
  });

  it("stops a price chain that doesn't join up", () => {
    const found = problems((text) =>
      text.replace('from: 13.99, to: 15.99', 'from: 12.99, to: 15.99')
    );
    expect(found).toEqual([expect.stringContaining('was 13.99 before this, not 12.99')]);
  });

  it('wants the year in the first sentence', () => {
    const found = problems((text) =>
      text.replace('on 10 November 2021, keeping', 'last autumn, keeping')
    );
    expect(found).toEqual([expect.stringContaining('with 2021 in it')]);
  });

  it('wants numbers as digits', () => {
    const found = problems((text) =>
      text.replace('Subscribers pay $24 a year more.', 'Thousands of subscribers pay more.')
    );
    expect(found).toEqual([expect.stringContaining('write "Thousands" as digits')]);
  });

  it('needs a real snapshot on every entry', () => {
    const found = problems((text) =>
      text.replace(
        'https://web.archive.org/web/20211110000000/https://blog.tubely.example/dislikes',
        'pending'
      )
    );
    expect(found).toContainEqual(
      expect.stringContaining('needs at least one source with a real snapshot')
    );
    expect(found).toContainEqual(expect.stringContaining('pending only goes on the extras'));
  });

  it('wants the year as a whole word, not inside another number', () => {
    const found = problems((text) =>
      text.replace('on 10 November 2021, keeping', 'for 120210 viewers, keeping')
    );
    expect(found).toEqual([expect.stringContaining('with 2021 in it')]);
  });

  it('only takes real country codes', () => {
    const found = problems((text) => text.replace('regions: [US]', 'regions: [ZZ]'));
    expect(found).toEqual([expect.stringContaining('two-letter country codes')]);
  });

  it('refuses two price moves for one plan on the same day', () => {
    const found = problems((text) =>
      text.replace(
        '    date: 2026-04\n    date_kind: reported',
        '    date: 2023-07-20\n    effective: 2023-08\n    date_kind: reported'
      )
    );
    expect(found).toContainEqual(expect.stringContaining('one price change per plan per day'));
  });

  it("keeps the price history page's question for the price history page", () => {
    const found = problems((text) =>
      text.replace('When did Tubely Premium first go up?', 'When did Tubely raise its prices?')
    );
    expect(found).toEqual([expect.stringContaining('belongs to the price history page')]);
  });

  it('refuses a service called after a page', () => {
    const found = problems((text) => text.replace('service: tubely', 'service: prices'), 'prices');
    expect(found).toContainEqual(expect.stringContaining('"prices" is a page on the site already'));
  });

  it('names fields it does not know', () => {
    const found = problems((text) =>
      text.replace('    severity: 3', '    severity: 3\n    vibe: bad')
    );
    expect(found).toEqual([expect.stringContaining('"vibe" isn\'t a field we use')]);
  });

  it('catches a related link to nowhere', () => {
    const found = problems((text) => text.replace('[tubely/dislikes-hidden]', '[tubely/nope]'));
    expect(found).toEqual([expect.stringContaining('"tubely/nope" isn\'t a change')]);
  });
});
