<script lang="ts">
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { formatDate, shortDate } from '#lib/dates.ts';
  import { money, perBilling, percent } from '#lib/format.ts';
  import type { Rise } from '#lib/prices.ts';

  let { data } = $props();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Price league', path: '/prices' }
  ];
  const [top] = $derived(data.ranked);
  const description = $derived(
    top
      ? `${top.plan.serviceName} ${top.plan.name} (${top.plan.region}) is up ${percent(top.rise)} since January 2020, against ${percent(top.inflation ?? 0)} inflation. Every subscription plan still on sale since 2020, ranked like for like.`
      : 'Every subscription plan still on sale since January 2020, ranked by how much it has gone up, like for like.'
  );
</script>

<Seo
  title="Which subscriptions have gone up most since 2020"
  {description}
  path="/prices"
  {crumbs}
  alt="The price league: subscription plans ranked by their rise since January 2020, with inflation alongside."
/>

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>Which subscriptions have gone up most since 2020</h1>
  <p>
    Every plan that was on sale in January 2020 and still is, same plan, same country, same billing
    period, ranked by how much it's gone up. Inflation over the same months sits next to it, so
    anything above that line is the company's own doing.
  </p>
</header>

{#snippet row(rise: Rise, rank?: number)}
  <tr>
    {#if rank}<td class="rank">{rank}</td>{/if}
    <th scope="row">
      <a href="/{rise.plan.service}/price-history">{rise.plan.serviceName} {rise.plan.name}</a>
      <span>{rise.plan.region}, {perBilling[rise.plan.billing]}</span>
    </th>
    <td
      >{money(rise.from, rise.plan.currency)}{#if !rank}<span>, {shortDate(rise.since)}</span
        >{/if}</td
    >
    <td>{money(rise.now, rise.plan.currency)}</td>
    <td class="rise">{percent(rise.rise)}</td>
    <td>{rise.inflation === undefined ? 'n/a' : percent(rise.inflation)}</td>
  </tr>
{/snippet}

{#if data.ranked.length}
  <table class="league">
    <caption class="visually-hidden">Plans ranked by their rise since January 2020</caption>
    <thead>
      <tr>
        <th scope="col" class="rank">#</th>
        <th scope="col">Plan</th>
        <th scope="col">Jan 2020</th>
        <th scope="col">Now</th>
        <th scope="col">Rise</th>
        <th scope="col">Inflation</th>
      </tr>
    </thead>
    <tbody>
      {#each data.ranked as rise, index (rise.plan.key)}
        {@render row(rise, index + 1)}
      {/each}
    </tbody>
  </table>
{:else}
  <p class="empty">
    No plans with a full price history back to 2020 yet. They're being sourced one rise at a time.
  </p>
{/if}

{#if data.newer.length}
  <section aria-labelledby="newer">
    <h2 id="newer">Launched since</h2>
    <p>
      These didn't exist in January 2020, so they can't be ranked fairly. Here's their rise since
      launch.
    </p>
    <table class="league">
      <thead>
        <tr>
          <th scope="col">Plan</th>
          <th scope="col">At launch</th>
          <th scope="col">Now</th>
          <th scope="col">Rise</th>
          <th scope="col">Inflation</th>
        </tr>
      </thead>
      <tbody>
        {#each data.newer as rise (rise.plan.key)}
          {@render row(rise)}
        {/each}
      </tbody>
    </table>
  </section>
{/if}

<p class="note">
  Prices are as each company lists them: US before sales tax, UK including VAT. Inflation is the US
  CPI-U from the Bureau of Labor Statistics and the UK CPI from the ONS, to {formatDate(
    data.cpiTo
  )}. A renamed plan only counts as the same one when a source says so. Want your own total?
  <a href="/bill">Work out your bill</a>.
</p>

<style>
  table {
    margin-bottom: var(--space-7);

    & tbody th a {
      text-decoration: none;

      &:hover {
        text-decoration: underline 2px;
      }
    }

    & td span {
      color: var(--ink-soft);
    }
  }

  .rank {
    color: var(--ink-soft);
  }

  .rise {
    font-size: var(--text-md);
    font-weight: 800;
  }

  section {
    display: grid;
    gap: var(--space-3);
  }

  .note,
  .empty {
    max-width: var(--measure);
    font-size: var(--text-sm);
    color: var(--ink-soft);
  }

  @media (max-width: 40rem) {
    table {
      font-size: var(--text-sm);
    }

    .rank {
      display: none;
    }
  }
</style>
