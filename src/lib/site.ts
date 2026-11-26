export const site = {
  name: 'The Enshittification Index',
  short: 'Enshittification Index',
  url: 'https://enshittification.peng.ly',
  repo: 'https://github.com/NotAFlightRisk/enshittification',
  description:
    'Every price rise, new ad format, paywall, removed feature and API lockdown at the big services, dated, sourced and archived.'
};

// the about page's other projects, with their logos in static/apps
export const relatedApps = [
  {
    slug: 'fineprint',
    name: 'fineprint',
    about: 'VPNs graded on what they log, not on who paid for the review',
    url: 'https://fineprint.peng.ly'
  },
  {
    slug: 'awesome-privacy-guide',
    name: 'Awesome Privacy Guide',
    about: 'Private alternatives to the apps that went off',
    url: 'https://awesomeprivacy.peng.ly'
  },
  {
    slug: 'exitformat',
    name: 'Exit Format',
    about: 'How to get your data out before the next price rise',
    url: 'https://exitformat.peng.ly'
  },
  {
    slug: 'android-rom-compat',
    name: 'Android ROM Compat',
    about: 'Keep your phone going after its maker stops caring',
    url: 'https://android-rom-compat.peng.ly'
  },
  {
    slug: 'git-star-ranking',
    name: 'git-star-ranking',
    about: 'GitHub users and repos ranked by stars, with no promoted results',
    url: 'https://git-star-ranking.com'
  },
  {
    slug: 'afterlife',
    name: 'Hacker Afterlife',
    about: 'Every Hacker News link that died, with an archived copy',
    url: 'https://afterlife.peng.ly'
  },
  {
    slug: 'hearsay',
    name: 'hearsay',
    about: "Watch the internet's routing live on a 3D globe",
    url: 'https://hearsay.peng.ly'
  },
  {
    slug: 'haveibeentrainedon',
    name: 'Have I Been Trained On?',
    about: 'Find out if your writing got scraped to train an AI',
    url: 'https://haveibeentrainedon.peng.ly'
  }
];

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
