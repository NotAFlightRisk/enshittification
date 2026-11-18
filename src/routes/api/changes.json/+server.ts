import { data } from '#lib/server/data.ts';
import { site } from '#lib/site.ts';

export const prerender = true;

export const GET = () => {
  const { built, companies, services } = data();
  return Response.json({
    name: site.name,
    url: site.url,
    licence: 'CC BY 4.0, https://creativecommons.org/licenses/by/4.0/',
    built,
    companies,
    services: services.map(({ changes, plans, companyName, ...service }) => ({
      ...service,
      plans: plans.map(({ service: _, serviceName, key, ...plan }) => plan),
      changes: changes.map(({ service: _, serviceName, key, ...change }) => change)
    }))
  });
};
