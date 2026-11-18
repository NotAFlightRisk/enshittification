import { isFullDate, isPartialDate, startOf, yearOf } from '#lib/dates.ts';
import type { YamlFile } from '#lib/data/load.ts';
import {
  billings,
  categories,
  currencies,
  dateKinds,
  reserved,
  sourceKinds,
  statuses,
  type Change,
  type Plan,
  type ServiceFile
} from '#lib/data/types.ts';

export interface Problem {
  file: string;
  line: number;
  path: string;
  message: string;
  warning?: boolean;
}

type Path = (string | number)[];
type Flag = (path: Path, message: string) => void;

const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const snapshot = /^https:\/\/web\.archive\.org\/web\/\d{14}\/https?:\/\/.+/;
const numberWords =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|(thir|four|fif|six|seven|eigh|nine)teen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundreds?|thousands?|millions?|billions?|dozens?)\b/i;
const priceQuestion = /^when did .+ (raise|put up|increase) (its|their) prices?\?$/i;

export const maxTitle = 90;
export const maxLede = 160;

const keys = {
  service: ['service', 'name', 'company', 'url', 'crw', 'wikipedia', 'plans', 'changes'],
  serviceRequired: ['service', 'name', 'company', 'url', 'changes'],
  plan: [
    'id',
    'name',
    'region',
    'currency',
    'billing',
    'since',
    'price',
    'source',
    'replaces',
    'like_for_like',
    'incomplete'
  ],
  planRequired: ['id', 'name', 'region', 'currency', 'billing', 'since', 'price', 'source'],
  change: [
    'id',
    'date',
    'date_kind',
    'effective',
    'category',
    'title',
    'question',
    'what_changed',
    'before',
    'after',
    'user_impact',
    'company_said',
    'severity',
    'status',
    'reversed',
    'regions',
    'prices',
    'related',
    'sources',
    'corrections',
    'added',
    'updated',
    'sources_checked',
    'status_checked'
  ],
  changeRequired: [
    'id',
    'date',
    'date_kind',
    'category',
    'title',
    'what_changed',
    'user_impact',
    'severity',
    'status',
    'sources',
    'added',
    'updated',
    'sources_checked',
    'status_checked'
  ],
  source: ['url', 'publisher', 'kind', 'published', 'archive', 'quote', 'paywalled'],
  sourceRequired: ['url', 'publisher', 'kind', 'published', 'archive', 'quote'],
  company: ['id', 'name', 'url', 'wikipedia'],
  companyRequired: ['id', 'name', 'url']
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isUrl = (value: unknown) => typeof value === 'string' && /^https:\/\/[^\s]+$/.test(value);

/** The first sentence, which is what search results and share cards show */
export const firstSentence = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z0-9"$£])/)[0];

export const effectiveOf = (change: Pick<Change, 'date' | 'effective'>) =>
  startOf(change.effective ?? change.date);

function fields(
  value: Record<string, unknown>,
  known: string[],
  required: string[],
  path: Path,
  flag: Flag
) {
  for (const key of Object.keys(value))
    if (!known.includes(key))
      flag([...path, key], `"${key}" isn't a field we use - try one of ${known.join(', ')}`);
  for (const key of required)
    if (value[key] === undefined || value[key] === null) flag(path, `needs a "${key}"`);
}

function oneOf(value: unknown, options: readonly string[], path: Path, flag: Flag) {
  if (value !== undefined && !options.includes(value as string))
    flag(path, `"${value}" isn't one of ${options.join(', ')}`);
}

function date(value: unknown, path: Path, flag: Flag, full = false) {
  if (value === undefined) return;
  if (!(full ? isFullDate : isPartialDate)(value))
    flag(path, full ? 'should be a date like 2026-11-18' : 'should be YYYY, YYYY-MM or YYYY-MM-DD');
}

function source(value: unknown, path: Path, flag: Flag) {
  if (!isObject(value)) return flag(path, 'should be a source with url, publisher, kind and so on');
  fields(value, keys.source, keys.sourceRequired, path, flag);
  if (value.url !== undefined && !isUrl(value.url)) flag([...path, 'url'], 'should be an https URL');
  oneOf(value.kind, sourceKinds, [...path, 'kind'], flag);
  date(value.published, [...path, 'published'], flag);
  if (
    value.archive !== undefined &&
    !['pending', 'blocked'].includes(value.archive as string) &&
    !snapshot.test(String(value.archive))
  )
    flag(
      [...path, 'archive'],
      'should be a Wayback snapshot (https://web.archive.org/web/<timestamp>/<url>), pending or blocked'
    );
  if (value.quote !== undefined && !isText(value.quote))
    flag([...path, 'quote'], 'needs the sentence from the page that backs this');
  if (value.paywalled !== undefined && typeof value.paywalled !== 'boolean')
    flag([...path, 'paywalled'], 'should be true or false');
}

function sources(value: unknown, path: Path, flag: Flag) {
  if (!Array.isArray(value) || !value.length) return flag(path, 'needs at least one source');
  value.forEach((item, index) => source(item, [...path, index], flag));
  const list = value.filter(isObject);
  if (!list.some(({ archive }) => snapshot.test(String(archive))))
    flag(path, 'needs at least one source with a real snapshot before it can go live');
  if (list[0]?.paywalled) flag([...path, 0], "the first source can't be a paywalled one");
}

function words(value: unknown, path: Path, flag: Flag) {
  const found = typeof value === 'string' && value.match(numberWords);
  if (found) flag(path, `write "${found[0]}" as digits, so the numbers check can see it`);
}

function plan(value: unknown, path: Path, flag: Flag, ids: Set<string>) {
  if (!isObject(value)) return flag(path, 'should be a plan with id, name, region and so on');
  fields(value, keys.plan, keys.planRequired, path, flag);
  const id = value.id as string;
  if (id !== undefined && !slug.test(String(id)))
    flag([...path, 'id'], 'should be lowercase-with-dashes, like individual-us');
  oneOf(value.region, Object.keys(currencies), [...path, 'region'], flag);
  if (value.region && value.currency !== currencies[value.region as keyof typeof currencies])
    flag([...path, 'currency'], `a ${value.region} plan is priced in ${currencies[value.region as keyof typeof currencies]}`);
  oneOf(value.billing, billings, [...path, 'billing'], flag);
  date(value.since, [...path, 'since'], flag);
  if (value.price !== undefined && !(typeof value.price === 'number' && value.price > 0))
    flag([...path, 'price'], 'should be a number, like 9.99');
  if (value.source !== undefined) {
    source(value.source, [...path, 'source'], flag);
    if (isObject(value.source) && !snapshot.test(String(value.source.archive)))
      flag([...path, 'source', 'archive'], 'a launch price needs a real snapshot behind it');
  }
  if (value.replaces !== undefined && (value.replaces === id || !ids.has(String(value.replaces))))
    flag([...path, 'replaces'], `"${value.replaces}" isn't another plan in this file`);
  if (value.like_for_like !== undefined) {
    if (typeof value.like_for_like !== 'boolean')
      flag([...path, 'like_for_like'], 'should be true or false');
    if (value.replaces === undefined)
      flag([...path, 'like_for_like'], 'only means something next to replaces');
  }
  if (value.incomplete !== undefined && !isText(value.incomplete))
    flag([...path, 'incomplete'], "should say why it can't be charted yet");
}

function change(value: unknown, path: Path, flag: Flag, plans: Set<string>) {
  if (!isObject(value)) return flag(path, 'should be a change with id, date, title and so on');
  fields(value, keys.change, keys.changeRequired, path, flag);
  const at = (key: string) => [...path, key];

  if (value.id !== undefined && !slug.test(String(value.id)))
    flag(at('id'), 'should be lowercase-with-dashes, like premium-price-2023');
  if (value.id === 'price-history') flag(at('id'), 'price-history is taken by the price page');
  date(value.date, at('date'), flag);
  date(value.effective, at('effective'), flag);
  oneOf(value.date_kind, dateKinds, at('date_kind'), flag);
  oneOf(value.category, Object.keys(categories), at('category'), flag);
  oneOf(value.status, Object.keys(statuses), at('status'), flag);
  if (value.severity !== undefined && ![1, 2, 3].includes(value.severity as number))
    flag(at('severity'), 'should be 1, 2 or 3');

  for (const key of ['title', 'what_changed', 'user_impact'])
    if (value[key] !== undefined && !isText(value[key])) flag(at(key), 'should be some words');
  for (const key of ['title', 'what_changed', 'before', 'after', 'user_impact'])
    words(value[key], at(key), flag);
  if (isText(value.title) && value.title.length > maxTitle)
    flag(at('title'), `is ${value.title.length} characters, keep it under ${maxTitle}`);

  if (isText(value.what_changed) && isPartialDate(value.date)) {
    const lede = firstSentence(value.what_changed);
    if (!lede.includes(String(yearOf(value.date))))
      flag(at('what_changed'), `the first sentence should say when, with ${yearOf(value.date)} in it`);
    if (lede.length > maxLede)
      flag(at('what_changed'), `the first sentence is ${lede.length} characters, keep it under ${maxLede}`);
  }
  if (value.question !== undefined) {
    if (!isText(value.question) || !value.question.endsWith('?'))
      flag(at('question'), 'should be the question people search, ending in ?');
    else if (priceQuestion.test(value.question))
      flag(at('question'), 'that one belongs to the price history page, not a single change');
  }

  if (value.status === 'reversed' && value.reversed === undefined)
    flag(at('status'), 'a reversed change needs a "reversed" with date, what and sources');
  if (value.reversed !== undefined) {
    const reversed = value.reversed;
    if (value.status !== 'reversed') flag(at('reversed'), 'only goes on a reversed change');
    if (!isObject(reversed)) flag(at('reversed'), 'should have date, what and sources');
    else {
      fields(reversed, ['date', 'what', 'sources'], ['date', 'what', 'sources'], at('reversed'), flag);
      date(reversed.date, [...at('reversed'), 'date'], flag);
      sources(reversed.sources, [...at('reversed'), 'sources'], flag);
    }
  }

  if (value.regions !== undefined) {
    const list = value.regions;
    if (!Array.isArray(list) || !list.every((code) => /^[A-Z]{2}$/.test(String(code))))
      flag(at('regions'), 'should be a list of two-letter country codes, like [US, GB]');
  }
  if (value.prices !== undefined) {
    if (!Array.isArray(value.prices)) flag(at('prices'), 'should be a list of plan, from and to');
    else
      value.prices.forEach((move, index) => {
        const where = [...at('prices'), index];
        if (!isObject(move)) return flag(where, 'should have plan, from and to');
        fields(move, ['plan', 'from', 'to'], ['plan', 'from', 'to'], where, flag);
        if (move.plan !== undefined && !plans.has(String(move.plan)))
          flag([...where, 'plan'], `"${move.plan}" isn't a plan in this file`);
        for (const key of ['from', 'to'])
          if (move[key] !== undefined && !(typeof move[key] === 'number' && move[key] > 0))
            flag([...where, key], 'should be a price, like 9.99');
      });
  }
  if (value.related !== undefined && !Array.isArray(value.related))
    flag(at('related'), 'should be a list of service/change ids');

  sources(value.sources, at('sources'), flag);

  if (value.corrections !== undefined) {
    if (!Array.isArray(value.corrections)) flag(at('corrections'), 'should be a list of date and what');
    else
      value.corrections.forEach((fix, index) => {
        const where = [...at('corrections'), index];
        if (!isObject(fix)) return flag(where, 'should have date and what');
        fields(fix, ['date', 'what'], ['date', 'what'], where, flag);
        date(fix.date, [...where, 'date'], flag, true);
      });
  }
  for (const key of ['added', 'updated', 'sources_checked', 'status_checked'])
    date(value[key], at(key), flag, true);
  if (isFullDate(value.added) && isFullDate(value.updated) && value.updated < value.added)
    flag(at('updated'), "can't be before added");
}

/** Every `from` has to be the plan's previous price, so a wrong "before" stops the build */
function chains(file: ServiceFile, flag: Flag) {
  const plans: Plan[] = file.plans ?? [];
  const moves = file.changes.flatMap((item, index) =>
    (Array.isArray(item.prices) ? item.prices : []).map((move, at) => ({
      ...move,
      when: isPartialDate(item.effective ?? item.date) ? effectiveOf(item) : '',
      path: ['changes', index, 'prices', at] as Path
    }))
  );
  for (const item of plans) {
    if (item.incomplete || !isPartialDate(item.since)) continue;
    let price = item.price;
    const own = moves
      .filter((move) => move.plan === item.id && move.when)
      .sort((a, b) => a.when.localeCompare(b.when));
    for (const move of own) {
      if (move.when < startOf(item.since))
        flag(move.path, `moves ${item.id} before it launched (${item.since})`);
      if (move.from !== price)
        flag(
          [...move.path, 'from'],
          `${item.id} was ${price} before this, not ${move.from} - the chain doesn't join up`
        );
      price = move.to;
    }
  }
}

export interface Files {
  companies: YamlFile;
  services: YamlFile[];
  redirects?: YamlFile;
}

export function check({ companies, services, redirects }: Files): Problem[] {
  const problems: Problem[] = [];
  const flagger =
    (source: YamlFile): Flag =>
    (path, message) =>
      problems.push({
        file: source.file,
        line: source.lineOf(path),
        path: path.join('.').replace(/\.(\d+)/g, '[$1]'),
        message
      });
  const broken = (source: YamlFile) => {
    for (const { line, message } of source.errors)
      problems.push({ file: source.file, line, path: '', message: `isn't valid YAML: ${message}` });
    return source.errors.length > 0;
  };

  const companyIds = new Set<string>();
  if (!broken(companies)) {
    const flag = flagger(companies);
    if (!Array.isArray(companies.raw)) flag([], 'should be a list of companies');
    else
      companies.raw.forEach((company, index) => {
        if (!isObject(company)) return flag([index], 'should have id, name and url');
        fields(company, keys.company, keys.companyRequired, [index], flag);
        const id = String(company.id);
        if (!slug.test(id)) flag([index, 'id'], 'should be lowercase-with-dashes');
        if (companyIds.has(id)) flag([index, 'id'], `"${id}" is already taken`);
        companyIds.add(id);
        for (const key of ['url', 'wikipedia'])
          if (company[key] !== undefined && !isUrl(company[key]))
            flag([index, key], 'should be an https URL');
      });
  }

  const questions = new Map<string, string>();
  const keysSeen = new Set<string>();
  const related: { from: YamlFile; path: Path; key: string }[] = [];

  for (const source of services) {
    if (broken(source)) continue;
    const flag = flagger(source);
    const raw = source.raw;
    if (!isObject(raw)) {
      flag([], 'should be a YAML map, starting with service:');
      continue;
    }
    fields(raw, keys.service, keys.serviceRequired, [], flag);
    if (raw.service !== source.id) flag(['service'], `should match the file name, ${source.id}`);
    if (!slug.test(source.id)) flag([], 'the file name should be lowercase-with-dashes');
    if (reserved.includes(source.id)) flag(['service'], `"${source.id}" is a page on the site already`);
    if (raw.company !== undefined && !companyIds.has(String(raw.company)))
      flag(['company'], `"${raw.company}" isn't in data/companies.yaml`);
    for (const key of ['url', 'crw', 'wikipedia'])
      if (raw[key] !== undefined && !isUrl(raw[key])) flag([key], 'should be an https URL');

    const planIds = new Set<string>();
    if (raw.plans !== undefined) {
      if (!Array.isArray(raw.plans)) flag(['plans'], 'should be a list of plans');
      else {
        for (const item of raw.plans) if (isObject(item)) planIds.add(String(item.id));
        const seen = new Set<string>();
        raw.plans.forEach((item, index) => {
          plan(item, ['plans', index], flag, planIds);
          const id = isObject(item) ? String(item.id) : '';
          if (seen.has(id)) flag(['plans', index, 'id'], `"${id}" is already taken`);
          seen.add(id);
        });
      }
    }

    if (!Array.isArray(raw.changes) || !raw.changes.length) {
      flag(['changes'], 'needs at least one change');
      continue;
    }
    raw.changes.forEach((item, index) => {
      change(item, ['changes', index], flag, planIds);
      if (!isObject(item)) return;
      const key = `${source.id}/${item.id}`;
      if (keysSeen.has(key)) flag(['changes', index, 'id'], `"${item.id}" is already taken`);
      keysSeen.add(key);
      if (isText(item.question)) {
        const question = item.question.toLowerCase();
        if (questions.has(question))
          flag(['changes', index, 'question'], `${questions.get(question)} already asks this`);
        questions.set(question, key);
      }
      if (Array.isArray(item.related))
        item.related.forEach((target, at) =>
          related.push({ from: source, path: ['changes', index, 'related', at], key: String(target) })
        );
    });
    if (Array.isArray(raw.plans) && raw.changes.every(isObject))
      chains(raw as unknown as ServiceFile, flag);
  }

  for (const { from, path, key } of related)
    if (!keysSeen.has(key)) flagger(from)(path, `"${key}" isn't a change - use service/change`);

  if (redirects && !broken(redirects)) {
    const flag = flagger(redirects);
    if (!Array.isArray(redirects.raw)) flag([], 'should be a list of from and to');
    else
      redirects.raw.forEach((item, index) => {
        if (!isObject(item)) return flag([index], 'should have from and to');
        fields(item, ['from', 'to'], ['from', 'to'], [index], flag);
        for (const key of ['from', 'to'])
          if (!/^\/[a-z0-9/-]+$/.test(String(item[key])))
            flag([index, key], 'should be a path on this site, like /youtube/old-id');
        if (keysSeen.has(String(item.from).slice(1)))
          flag([index, 'from'], 'is still a live change, so it would never redirect');
      });
  }

  return problems;
}
