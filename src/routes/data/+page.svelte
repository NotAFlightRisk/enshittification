<script lang="ts">
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { plural } from '#lib/format.ts';
  import { absolute, site } from '#lib/site.ts';

  let { data } = $props();
  const { counts } = $derived(data);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Data', path: '/data' }
  ];
  const description = $derived(
    `${plural(counts.changes, 'dated change')} at ${plural(counts.services, 'service')}, with ${plural(counts.sources, 'source')}, as JSON and CSV under CC BY 4.0.`
  );
  const schema = $derived([
    {
      '@type': 'Dataset',
      name: site.name,
      description: `${site.description} ${description}`,
      url: absolute('/data'),
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: site.name, url: site.url },
      temporalCoverage: `${counts.first}/${counts.last}`,
      dateModified: counts.updated,
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: absolute('/api/changes.json') },
        { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: absolute('/api/changes.csv') }
      ]
    }
  ]);
</script>

<Seo title="The data: every change as JSON and CSV" {description} path="/data" {crumbs} {schema} />

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>The data</h1>
  <p>{description} Use it for anything, just say where it came from and link back.</p>
</header>

<section class="prose">
  <h2>Downloads</h2>
  <ul>
    <li><a href="/api/changes.json">changes.json</a>: every change with its sources, plans and prices</li>
    <li><a href="/api/changes.csv">changes.csv</a>: one row per change, for a spreadsheet</li>
    <li><a href="{site.repo}/tree/main/data">The YAML it's built from</a>, one file per service, on GitHub</li>
  </ul>

  <h2>Licence</h2>
  <p>
    The data is under <a href="https://creativecommons.org/licenses/by/4.0/" rel="external license">CC BY 4.0</a>,
    so credit "{site.name}" with a link to {site.url}. The code is MIT. Quotes in the sources belong to
    whoever wrote them, and are there so you can check the claim.
  </p>

  <h2>Inflation figures</h2>
  <ul>
    {#each data.cpi as series (series.region)}
      <li>
        {series.region}: <a href={series.source} rel="external">{series.name}</a>, {series.licence},
        refreshed {series.updated}
      </li>
    {/each}
  </ul>
</section>

