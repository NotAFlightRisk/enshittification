import { data } from '#lib/server/data.ts';

export const load = () => ({
  fixes: data()
    .changes.flatMap((entry) =>
      (entry.corrections ?? []).map((fix) => ({ ...fix, path: entry.path, title: entry.title }))
    )
    .sort((a, b) => b.date.localeCompare(a.date))
});
