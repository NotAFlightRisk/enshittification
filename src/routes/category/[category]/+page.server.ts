import { error } from '@sveltejs/kit';
import { data } from '#lib/server/data.ts';
import { categories, type Category } from '#lib/data/types.ts';
import { firstYear, listIndexed, nouns } from '#lib/seo.ts';
import { listOf, plural } from '#lib/format.ts';

export const entries = () => Object.keys(categories).map((category) => ({ category }));

export const load = ({ params }) => {
  if (!(params.category in categories)) error(404, 'No such kind of change');
  const category = params.category as Category;
  const changes = data().changes.filter((change) => change.category === category);
  const services = [...new Set(changes.map(({ serviceName }) => serviceName))];
  const [one, many] = nouns[category];
  return {
    category,
    changes,
    heading: categories[category],
    title: changes.length
      ? `Every ${one} since ${firstYear(changes)}, dated and sourced`
      : `Every ${one}, dated and sourced`,
    description: changes.length
      ? `${plural(changes.length, one, many)} at ${listOf(services)}, newest first, each with its date and sources.`
      : `No ${many} logged yet. Which, frankly, is suspicious.`,
    indexed: listIndexed(changes)
  };
};
