import { error } from '@sveltejs/kit';
import { data } from '#lib/server/data.ts';
import { firstYear, listIndexed } from '#lib/seo.ts';
import { listOf, plural } from '#lib/format.ts';

export const entries = () => data().companies.map(({ id }) => ({ company: id }));

export const load = ({ params }) => {
  const { companies, services, changes } = data();
  const company = companies.find(({ id }) => id === params.company);
  if (!company) error(404, 'No such company');
  const own = services.filter((service) => service.company === company.id);
  const list = changes.filter(({ service }) => own.some((item) => item.service === service));
  const names = listOf(own.map(({ name }) => name));
  return {
    company,
    services: own.map(({ service, name }) => ({ service, name })),
    changes: list,
    title: `${company.name}: every change at ${names} since ${firstYear(list)}, dated`,
    description: `${plural(list.length, 'change')} at ${names}, newest first, each with its date and sources.`,
    indexed: listIndexed(list)
  };
};
