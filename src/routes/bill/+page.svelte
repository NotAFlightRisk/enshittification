<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { replaceState } from '$app/navigation';
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { formatDate } from '#lib/dates.ts';
  import { money, perBilling } from '#lib/format.ts';

  let { data } = $props();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Your bill', path: '/bill' }
  ];

  const picked = new SvelteSet<string>();
  let year = $state(2020);

  const services = $derived(Map.groupBy(data.plans, ({ service }) => service));
  const chosen = $derived(data.plans.filter(({ key }) => picked.has(key)));
  const perYear = { month: 12, year: 1 };

  const totals = $derived(
    [...Map.groupBy(chosen, ({ currency }) => currency)].map(([currency, plans]) => {
      const sum = (pick: (plan: (typeof plans)[number]) => number | undefined) =>
        plans.reduce((total, plan) => total + (pick(plan) ?? 0) * perYear[plan.billing], 0);
      const known = plans.filter((plan) => plan.then[year]);
      return {
        currency,
        now: sum((plan) => plan.now),
        nowKnown: known.reduce((total, plan) => total + plan.now * perYear[plan.billing], 0),
        then: known.reduce(
          (total, plan) => total + plan.then[year]!.price * perYear[plan.billing],
          0
        ),
        kept: known.reduce(
          (total, plan) => total + (plan.then[year]!.kept ?? 0) * perYear[plan.billing],
          0
        ),
        missing: plans.length - known.length
      };
    })
  );

  function remember() {
    const url = new URL(location.href);
    url.search = picked.size
      ? new URLSearchParams({ plans: [...picked].join(','), year: String(year) }).toString()
      : '';
    replaceState(url, {});
  }

  onMount(() => {
    const query = new URLSearchParams(location.search);
    for (const key of query.get('plans')?.split(',') ?? [])
      if (data.plans.some((plan) => plan.key === key)) picked.add(key);
    const asked = Number(query.get('year'));
    if (data.years.includes(asked)) year = asked;
  });

  function toggle(key: string) {
    if (picked.has(key)) picked.delete(key);
    else picked.add(key);
    remember();
  }
</script>

<Seo
  title="What your subscriptions cost now against any year since 2010"
  description="Tick the plans you pay for, pick a year, and see what each one cost then against now, with the inflation-adjusted price alongside."
  path="/bill"
  {crumbs}
  alt="Your bill: tick your subscriptions and compare what they cost now with any year since 2010."
/>

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>Your bill</h1>
  <p>
    Tick what you pay for and pick a year. You'll get what each plan cost at the start of that year,
    what it costs now, and what the old price would be if it had only kept up with inflation.
  </p>
</header>

<div class="bill">
  <form class="pick" onsubmit={(event) => event.preventDefault()}>
    <label class="year">
      Compare with the start of
      <select bind:value={year} onchange={remember}>
        {#each data.years as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>
    {#each services as [service, plans] (service)}
      <fieldset>
        <legend>{service}</legend>
        {#each plans as plan (plan.key)}
          <label>
            <input
              type="checkbox"
              checked={picked.has(plan.key)}
              onchange={() => toggle(plan.key)}
            />
            <span
              >{plan.name}
              <small
                >{plan.region}, {money(plan.now, plan.currency)} {perBilling[plan.billing]}</small
              ></span
            >
          </label>
        {/each}
      </fieldset>
    {:else}
      <p>No plans with a complete price history yet.</p>
    {/each}
  </form>

  <section class="result" aria-live="polite">
    {#if !chosen.length}
      <p class="empty">Nothing ticked yet. Go on, it's only money.</p>
    {:else}
      <table class="league">
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Jan {year}</th>
            <th scope="col">Now</th>
            <th scope="col">Jan {year}, with inflation</th>
          </tr>
        </thead>
        <tbody>
          {#each chosen as plan (plan.key)}
            {@const then = plan.then[year]}
            <tr>
              <th scope="row"
                >{plan.service}
                {plan.name} <span>{plan.region}, {perBilling[plan.billing]}</span></th
              >
              <td>{then ? money(then.price, plan.currency) : "Didn't exist yet"}</td>
              <td>{money(plan.now, plan.currency)}</td>
              <td>{then?.kept ? money(Math.round(then.kept * 100) / 100, plan.currency) : '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#each totals as total (total.currency)}
        <p class="total">
          <b>{money(Math.round(total.now * 100) / 100, total.currency)} a year now.</b>
          {#if total.then}
            The same {total.missing ? "plans, minus the ones that didn't exist yet," : 'plans'} cost
            {money(Math.round(total.then * 100) / 100, total.currency)} a year at the start of {year},
            or {money(Math.round(total.kept * 100) / 100, total.currency)} in today's money. That's
            {money(Math.round((total.nowKnown - total.kept) * 100) / 100, total.currency)} a year more
            than inflation alone.
          {:else}
            None of these existed at the start of {year}.
          {/if}
        </p>
      {/each}
      <p class="note">
        Yearly totals count monthly plans twelve times. US prices are before sales tax, UK ones
        include VAT. Inflation runs to {formatDate(data.cpiTo)}.
      </p>
    {/if}
  </section>
</div>

<style>
  .bill {
    display: grid;
    grid-template-columns: minmax(16rem, 1fr) 2fr;
    gap: var(--space-7);
    align-items: start;
  }

  .pick {
    display: grid;
    gap: var(--space-5);
  }

  .year {
    display: grid;
    gap: var(--space-2);
    font-weight: 650;

    & select {
      padding: var(--space-2) var(--space-3);
      border: var(--rule-thin) solid var(--rule);
      background: var(--surface-raised);
    }
  }

  fieldset {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-3) 0 0;
    border: 0;
    border-top: var(--rule-thin) solid var(--rule);

    & legend {
      padding: 0 var(--space-2) 0 0;
      font-weight: 750;
    }

    & label {
      display: flex;
      gap: var(--space-2);
      align-items: baseline;
      cursor: pointer;
    }

    & small {
      display: block;
      color: var(--text-muted);
    }
  }

  .result {
    display: grid;
    gap: var(--space-4);
  }

  .total {
    font-size: var(--text-md);
    max-width: var(--measure);
  }

  .empty,
  .note {
    color: var(--text-muted);
  }

  .note {
    font-size: var(--text-sm);
  }

  @media (max-width: 50rem) {
    .bill {
      grid-template-columns: 1fr;
    }
  }
</style>
