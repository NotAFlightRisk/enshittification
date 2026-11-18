export const site = {
  name: 'The Enshittification Index',
  short: 'Enshittification Index',
  url: 'https://enshittification.peng.ly',
  repo: 'https://github.com/NotAFlightRisk/enshittification',
  description:
    'Every price rise, new ad format, paywall, removed feature and API lockdown at the big services, dated, sourced and archived.'
};

// every page lives at its path with no trailing slash, and the home page at /
export const absolute = (path: string) => new URL(path, site.url).href;

export const schemaIds = { website: absolute('/#website'), publisher: absolute('/#publisher') };

// each page's social image is drawn at build time, at /og/<page>.png
export const ogSize = { width: 1200, height: 630 };
export const ogPage = (path: string) => path.slice(1).replaceAll('/', '--') || 'index';

export const dataFile = (service: string) => `data/services/${service}.yaml`;
export const editUrl = (service: string) => `${site.repo}/edit/main/${dataFile(service)}`;

/** The correction form, filled in with the entry and its title */
export function correctionUrl(key?: string, title?: string) {
  const query = new URLSearchParams({ template: 'correction.yml' });
  if (key) query.set('entry', key);
  query.set('title', `Correction: ${title ?? ''}`.trim());
  return `${site.repo}/issues/new?${query}`;
}

export const suggestionUrl = `${site.repo}/issues/new?template=suggestion.yml`;
