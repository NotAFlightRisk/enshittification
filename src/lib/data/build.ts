import { loadCompanies, loadCpi, loadRedirects, loadServices } from '#lib/data/load.ts';
import { effectiveOf } from '#lib/data/check.ts';
import { startOf, today } from '#lib/dates.ts';
import type {
  Change,
  Company,
  Dataset,
  Entry,
  Plan,
  PlanHistory,
  Redirect,
  Service,
  ServiceFile
} from '#lib/data/types.ts';

/** Newest first, with the more precise of two equal dates first */
export const newestFirst = (a: { date: string }, b: { date: string }) =>
  startOf(b.date).localeCompare(startOf(a.date)) || b.date.length - a.date.length;

export function history(file: ServiceFile, plan: Plan): PlanHistory {
  const moves = file.changes
    .flatMap((change) =>
      (change.prices ?? [])
        .filter((move) => move.plan === plan.id)
        .map((move) => ({ date: effectiveOf(change), price: move.to, change: change.id }))
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    ...plan,
    service: file.service,
    serviceName: file.name,
    key: `${file.service}/${plan.id}`,
    steps: [{ date: startOf(plan.since), price: plan.price }, ...moves]
  };
}

const entryOf = (file: ServiceFile, change: Change): Entry => ({
  ...change,
  service: file.service,
  serviceName: file.name,
  key: `${file.service}/${change.id}`,
  path: `/${file.service}/${change.id}`
});

export function dataset(): Dataset {
  const companies = loadCompanies().raw as Company[];
  const files = loadServices().map(({ raw }) => raw as ServiceFile);
  const services: Service[] = files
    .map(({ changes, plans = [], ...file }) => ({
      ...file,
      companyName: companies.find(({ id }) => id === file.company)?.name ?? file.company,
      changes: changes.map((change) => entryOf({ ...file, changes }, change)).sort(newestFirst),
      plans: plans.map((plan) => history({ ...file, changes, plans }, plan))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    built: today(),
    companies,
    services,
    changes: services.flatMap(({ changes }) => changes).sort(newestFirst),
    plans: services.flatMap(({ plans }) => plans),
    cpi: { US: loadCpi('US'), UK: loadCpi('UK') },
    redirects: (loadRedirects()?.raw as Redirect[] | undefined) ?? []
  };
}
