import { error } from '@sveltejs/kit';
import { around, data, service } from '#lib/server/data.ts';
import { changeDescription, changeIndexed, changeTitle } from '#lib/seo.ts';

const regionNames = new Intl.DisplayNames(['en-GB'], { type: 'region' });

export const entries = () => data().changes.map(({ service, id }) => ({ service, change: id }));

export const load = ({ params }) => {
  const found = service(params.service);
  const entry = found?.changes.find(({ id }) => id === params.change);
  if (!found || !entry) error(404, 'No such change');
  return {
    entry,
    company: data().companies.find(({ id }) => id === found.company)!,
    title: changeTitle(entry),
    description: changeDescription(entry),
    indexed: changeIndexed(entry),
    regions: entry.regions?.map((code) => regionNames.of(code) ?? code),
    ...around(entry)
  };
};
