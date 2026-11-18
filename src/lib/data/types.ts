export const categories = {
  'price-rise': 'Price rise',
  ads: 'Ads',
  paywall: 'Paywall',
  'removed-feature': 'Removed feature',
  'api-restriction': 'API restriction',
  tracking: 'Tracking',
  'lock-out': 'Lock-out',
  bricked: 'Bricked',
  ai: 'AI pushed in'
} as const;

export const statuses = {
  'in-force': 'In force',
  reversed: 'Reversed',
  test: 'Test',
  scheduled: 'Coming up'
} as const;

export const dateKinds = ['announced', 'effective', 'reported'] as const;
export const sourceKinds = ['primary', 'press', 'pricing-page'] as const;
export const currencies = { US: 'USD', UK: 'GBP' } as const;
export const billings = ['month', 'year'] as const;

// top-level routes a service can't take, since /<service> shares their namespace
export const reserved = [
  'about',
  'api',
  'bill',
  'category',
  'company',
  'corrections',
  'data',
  'latest',
  'og',
  'prices',
  'random',
  'year'
];

export type Category = keyof typeof categories;
export type Status = keyof typeof statuses;
export type Region = keyof typeof currencies;

export interface Source {
  url: string;
  publisher: string;
  kind: (typeof sourceKinds)[number];
  published: string;
  archive: string;
  quote: string;
  paywalled?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  region: Region;
  currency: (typeof currencies)[Region];
  billing: (typeof billings)[number];
  since: string;
  price: number;
  source: Source;
  replaces?: string;
  like_for_like?: boolean;
  incomplete?: string;
}

export interface PriceMove {
  plan: string;
  from: number;
  to: number;
}

export interface Change {
  id: string;
  date: string;
  date_kind: (typeof dateKinds)[number];
  effective?: string;
  category: Category;
  title: string;
  question?: string;
  what_changed: string;
  before?: string;
  after?: string;
  user_impact: string;
  company_said?: string;
  severity: 1 | 2 | 3;
  status: Status;
  reversed?: { date: string; what: string; sources: Source[] };
  regions?: string[];
  prices?: PriceMove[];
  related?: string[];
  sources: Source[];
  corrections?: { date: string; what: string }[];
  added: string;
  updated: string;
  sources_checked: string;
  status_checked: string;
}

export interface ServiceFile {
  service: string;
  name: string;
  company: string;
  url: string;
  crw?: string;
  wikipedia?: string;
  plans?: Plan[];
  changes: Change[];
}

export interface Company {
  id: string;
  name: string;
  url: string;
  wikipedia?: string;
}

/** A change with where it lives, as the site shows it */
export interface Entry extends Change {
  service: string;
  serviceName: string;
  key: string;
  path: string;
}

export interface Step {
  date: string;
  price: number;
  change?: string;
}

/** A plan with its price chain worked out, oldest step first */
export interface PlanHistory extends Plan {
  service: string;
  serviceName: string;
  key: string;
  steps: Step[];
}

export interface Service extends Omit<ServiceFile, 'changes' | 'plans'> {
  companyName: string;
  changes: Entry[];
  plans: PlanHistory[];
}

export interface Cpi {
  region: Region;
  series: string;
  name: string;
  source: string;
  licence: string;
  updated: string;
  monthly: Record<string, number>;
}

export interface Redirect {
  from: string;
  to: string;
}

export interface Dataset {
  built: string;
  companies: Company[];
  services: Service[];
  changes: Entry[];
  plans: PlanHistory[];
  cpi: Record<Region, Cpi>;
  redirects: Redirect[];
}
