<script lang="ts">
  import Crumbs from '#lib/components/Crumbs.svelte';
  import PriceChart from '#lib/components/PriceChart.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { shortDate, yearOf } from '#lib/dates.ts';
  import { listOf, money, perBilling, percent } from '#lib/format.ts';

  let { data } = $props();
  const { service, product } = $derived(data);
  const countries = { US: 'US', UK: 'UK' };
  const names = { US: 'United States', UK: 'United Kingdom' };
  const lead = $derived(data.plans[0]);
  const leadNow = $derived(lead.steps.at(-1)!);
  const crumbs = $derived([
    { name: 'Home', path: '/' },
    { name: service.name, path: `/${service.service}` },
    { name: 'Price history', path: `/${service.service}/price-history` }
  ]);
  const regionWords = $derived(listOf(data.regions.map((region) => countries[region])));
  const description = $derived(
    `${lead.name} costs ${money(leadNow.price, lead.currency)} ${perBilling[lead.billing]} in the ${countries[lead.region]}, up from ${money(lead.steps[0].price, lead.currency)} when it launched in ${yearOf(lead.steps[0].date)}. Every ${regionWords} price since, with inflation alongside.`
  );
</script>

<Seo
  title="{product} price history: every {regionWords} price since launch"
  {description}
  path="/{service.service}/price-history"
  {crumbs}
  alt="{product} prices as step charts, from launch to now, with inflation dotted behind them."
/>

<header class="head">
  <Crumbs {crumbs} />
  <h1>{product} price history</h1>
  <p>{description}</p>
  <p class="note">
    US prices are before sales tax and UK ones include VAT, as each company lists them. The dotted
    line is the launch price kept up with that country's CPI, so you can see how much of the rise is
    just inflation.
  </p>
</header>

{#each data.regions as region (region)}
  <section class="region" aria-labelledby="region-{region}">
    <h2 id="region-{region}">{names[region]}</h2>
    {#each data.plans.filter((plan) => plan.region === region) as plan (plan.key)}
      {@const now = plan.steps.at(-1)!}
      <article class="plan" aria-labelledby="plan-{plan.id}">
        <h3 id="plan-{plan.id}">{plan.name}, {perBilling[plan.billing]}</h3>
        <p class="sum">
          {money(now.price, plan.currency)} now, {percent(now.price / plan.steps[0].price - 1)} since
          {shortDate(plan.steps[0].date)}.
        </p>
        <PriceChart
          chart={plan.chart}
          currency={plan.currency}
          service={service.service}
          label="{plan.name} in the {countries[region]}: {plan.steps
            .map((step) => `${money(step.price, plan.currency)} from ${shortDate(step.date)}`)
            .join(', ')}."
        />
        <table>
          <thead>
            <tr>
              <th scope="col">From</th><th scope="col">Price</th><th scope="col">Change</th><th
                scope="col"
              >
                Why we know
              </th>
            </tr>
          </thead>
          <tbody>
            {#each plan.steps.toReversed() as step, index (step.date)}
              {@const before = plan.steps[plan.steps.length - index - 2]}
              <tr>
                <td>{shortDate(step.date)}</td>
                <td>{money(step.price, plan.currency)}</td>
                <td>{before ? percent(step.price / before.price - 1) : 'Launch'}</td>
                <td>
                  {#if step.change}
                    <a href="/{service.service}/{step.change}">The change</a>
                  {:else}
                    <a href={plan.source.archive} rel="external nofollow">
                      {plan.source.publisher}
                    </a>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </article>
    {/each}
  </section>
{/each}

{#if data.incomplete.length}
  <section class="region" aria-labelledby="incomplete">
    <h2 id="incomplete">Not charted yet</h2>
    <p>These plans have a gap in their sourced history, so they're left off rather than guessed.</p>
    <ul>
      {#each data.incomplete as plan (plan.id)}
        <li><b>{plan.name}</b> ({plan.region}): {plan.incomplete}</li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .head {
    display: grid;
    gap: var(--space-4);
    margin-bottom: var(--space-7);

    & p {
      max-width: var(--measure);
      font-size: var(--text-md);
    }

    & .note {
      font-size: var(--text-sm);
      color: var(--ink-soft);
    }
  }

  .region {
    display: grid;
    gap: var(--space-6);
    padding-top: var(--space-5);
    margin-bottom: var(--space-7);
    border-top: var(--thick) solid var(--ink);

    & ul {
      display: grid;
      gap: var(--space-2);
      padding-left: var(--space-5);
    }
  }

  .plan {
    display: grid;
    gap: var(--space-3);
  }

  .sum {
    color: var(--ink-soft);
  }

  table {
    max-width: 44rem;
    font-size: var(--text-sm);
  }
</style>
