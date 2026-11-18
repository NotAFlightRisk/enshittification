import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { parse } from 'yaml';
import { effectiveOf } from '#lib/data/check.ts';
import { history } from '#lib/data/build.ts';
import { loadServices } from '#lib/data/load.ts';
import { today } from '#lib/dates.ts';
import { plural } from '#lib/format.ts';
import { missingNumbers, quoteFound } from '#lib/text.ts';
import type { Change, Plan, ServiceFile, Source } from '#lib/data/types.ts';
import { isSnapshot, livePage, snapshotText, Unavailable } from './wayback.ts';

// Reads every source an entry cites and checks its quote and its numbers are really in there

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: 'string' },
    report: { type: 'string' },
    weekly: { type: 'boolean', default: false }
  }
});

type Level = 'fail' | 'warn';
const findings: { level: Level; key: string; message: string }[] = [];
const note = (level: Level, key: string, message: string) => {
  findings.push({ level, key, message });
  console.log(`  ${level === 'fail' ? '✗' : '⚠'} ${message}`);
};

const files = loadServices().map(({ raw }) => raw as ServiceFile);

/** Every change and plan, by service/id, that differs from the same file at a git ref */
function changedSince(ref: string) {
  const keys = new Set<string>();
  for (const file of files) {
    let before: ServiceFile | undefined;
    try {
      const path = `data/services/${file.service}.yaml`;
      before = parse(execFileSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8' }));
    } catch {
      before = undefined;
    }
    for (const [list, old] of [
      [file.changes, before?.changes],
      [file.plans ?? [], before?.plans]
    ] as const)
      for (const item of list) {
        const was = old?.find(({ id }) => id === item.id);
        if (JSON.stringify(was) !== JSON.stringify(item)) keys.add(`${file.service}/${item.id}`);
      }
  }
  return keys;
}

const picked = args.base ? changedSince(args.base) : undefined;
const wanted = (file: ServiceFile, { id }: { id: string }) =>
  picked
    ? picked.has(`${file.service}/${id}`)
    : !positionals.length ||
      positionals.some((name) => name === file.service || name === `${file.service}/${id}`);

const texts = new Map<string, Promise<string>>();
function textOf(source: Source) {
  const key = isSnapshot(source.archive) ? source.archive : source.url;
  if (!texts.has(key))
    texts.set(
      key,
      isSnapshot(source.archive)
        ? snapshotText(source.archive)
        : livePage(source.url).then(({ status, text }) => {
            if (!text) throw new Error(`the live page answered ${status}`);
            return text;
          })
    );
  return texts.get(key)!;
}

async function checkLive(key: string, source: Source) {
  try {
    const { status, home } = await livePage(source.url);
    if (status === 404 || status === 410)
      note('warn', key, `${source.url} has gone (${status}), the archive covers it`);
    else if (home) note('warn', key, `${source.url} now redirects to its home page`);
  } catch (error) {
    note('warn', key, `${source.url} didn't answer live (${(error as Error).message})`);
  }
}

/** Reads each source and checks its quote is in it. `unread` counts the ones the archive was too busy for */
async function readAll(key: string, sources: Source[]) {
  const read: string[] = [];
  let unread = 0;
  for (const source of sources) {
    await checkLive(key, source);
    try {
      const text = await textOf(source);
      read.push(text);
      if (!quoteFound(source.quote, text))
        note(
          'fail',
          key,
          `the quote from ${source.publisher} isn't in ${isSnapshot(source.archive) ? 'its snapshot' : 'the page'}`
        );
    } catch (error) {
      const unreadable = error instanceof Unavailable || source.archive === 'blocked';
      if (error instanceof Unavailable) unread++;
      note(
        unreadable ? 'warn' : 'fail',
        key,
        `couldn't read ${source.publisher} (${(error as Error).message})`
      );
    }
  }
  return { read, unread };
}

function numbers(
  key: string,
  claim: (string | undefined)[],
  { read, unread }: Awaited<ReturnType<typeof readAll>>,
  exempt = new Set<string>()
) {
  if (!read.length) return;
  const missing = missingNumbers(claim.filter(Boolean).join(' '), read.join(' '), exempt);
  if (!missing.length) console.log('  ✓ quotes and numbers found');
  else if (unread)
    note('warn', key, `numbers not checked, since ${plural(unread, 'source')} couldn't be fetched`);
  else note('fail', key, `no source has ${missing.join(', ')}`);
}

async function checkChange(file: ServiceFile, change: Change) {
  const key = `${file.service}/${change.id}`;
  console.log(`\n${key}`);
  const exempt = new Set<string>();
  for (const move of change.prices ?? []) {
    exempt.add(String(move.from));
    exempt.add(`${Math.round((move.to / move.from - 1) * 100)}%`);
  }
  const claim = [
    change.title,
    change.what_changed,
    change.before,
    change.after,
    change.user_impact
  ];
  const prices = (change.prices ?? []).map(({ to }) => String(to));
  numbers(key, [...claim, ...prices], await readAll(key, change.sources), exempt);
  if (change.reversed)
    numbers(key, [change.reversed.what], await readAll(key, change.reversed.sources));
}

async function checkPlan(file: ServiceFile, plan: Plan) {
  const key = `${file.service}/${plan.id}`;
  console.log(`\n${key} (plan)`);
  numbers(key, [String(plan.price)], await readAll(key, [plan.source]));
}

async function weeklyExtras() {
  const day = today();
  const week = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  for (const file of files) {
    for (const change of file.changes) {
      const key = `${file.service}/${change.id}`;
      if (change.status === 'scheduled' && effectiveOf(change) <= day)
        note('warn', key, `was scheduled for ${change.effective ?? change.date} - did it happen?`);
      for (const source of change.sources)
        if (source.archive === 'pending' && change.updated < week)
          note('warn', key, `${source.publisher} has waited over a week for its snapshot`);
    }
    for (const plan of file.plans ?? []) {
      if (plan.incomplete || plan.source.kind !== 'pricing-page') continue;
      const latest = history(file, plan)
        .steps.filter((step) => step.date <= day)
        .at(-1)!;
      const key = `${file.service}/${plan.id}`;
      try {
        const { status, text } = await livePage(plan.source.url);
        if (!text) note('warn', key, `pricing page answered ${status}`);
        else if (!text.includes(String(latest.price)))
          note(
            'warn',
            key,
            `the pricing page doesn't show ${latest.price} any more - a quiet rise?`
          );
      } catch (error) {
        note('warn', key, `pricing page didn't answer (${(error as Error).message})`);
      }
    }
  }
}

const plans = files.flatMap((file) =>
  (file.plans ?? []).filter((plan) => wanted(file, plan)).map((plan) => [file, plan] as const)
);
const queue = files.flatMap((file) =>
  file.changes.filter((change) => wanted(file, change)).map((change) => [file, change] as const)
);
console.log(
  `Checking ${plural(queue.length, 'change')} and ${plural(plans.length, 'plan')}${picked ? ` changed since ${args.base}` : ''}`
);
for (const [file, change] of queue) await checkChange(file, change);
for (const [file, plan] of plans) await checkPlan(file, plan);
if (args.weekly) await weeklyExtras();

const fails = findings.filter(({ level }) => level === 'fail');
const verdict = fails.length
  ? `❌ ${plural(fails.length, 'problem')} in the sources`
  : `✅ ${plural(queue.length, 'change')} and ${plural(plans.length, 'plan')} checked against their sources`;
const warnings = findings.length - fails.length;
console.log(`\n${verdict}${warnings ? `, plus ${plural(warnings, 'warning')}` : ''}`);

const table = findings.map(
  ({ level, key, message }) =>
    `| ${level === 'fail' ? '❌' : '⚠️'} | \`${key}\` | ${message.replaceAll('|', '\\|')} |`
);
const markdown = [
  `### ${verdict}`,
  ...(table.length ? ['', '| | Entry | What |', '| --- | --- | --- |', ...table] : []),
  ''
].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
if (args.report) writeFileSync(args.report, markdown);
if (process.env.GITHUB_OUTPUT)
  appendFileSync(process.env.GITHUB_OUTPUT, `findings=${findings.length}\n`);

process.exitCode = fails.length ? 1 : 0;
