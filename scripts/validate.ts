import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';
import { check, type Problem } from '#lib/data/check.ts';
import { loadCompanies, loadRedirects, loadServices } from '#lib/data/load.ts';
import { plural } from '#lib/format.ts';

const services = loadServices();
const problems = check({
  companies: loadCompanies(),
  services,
  redirects: loadRedirects()
}).map((problem) => ({ ...problem, file: relative(process.cwd(), problem.file) }));

const describe = ({ path, message }: Problem) => `${path ? `${path} ` : ''}${message}`;

for (const [file, list] of Map.groupBy(problems, (problem) => problem.file)) {
  console.log(`\n${file}`);
  for (const problem of list) {
    console.log(`  ✗ line ${problem.line}: ${describe(problem)}`);
    if (process.env.GITHUB_ACTIONS)
      console.log(`::error file=${file},line=${problem.line}::${describe(problem)}`);
  }
}

const changes = services.reduce(
  (total, { raw }) => total + ((raw as { changes?: unknown[] })?.changes?.length ?? 0),
  0
);
const verdict = problems.length
  ? `❌ ${plural(problems.length, 'problem')} to fix before this can go in`
  : `✅ ${plural(changes, 'change')} across ${plural(services.length, 'service')} look good`;
console.log(`\n${verdict}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = problems.map(
    (problem) =>
      `| \`${problem.file}:${problem.line}\` | ${describe(problem).replaceAll('|', '\\|')} |`
  );
  const table = rows.length ? ['', '| Where | What |', '| --- | --- |', ...rows] : [];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [`### ${verdict}`, ...table, ''].join('\n'));
}

process.exitCode = problems.length ? 1 : 0;
