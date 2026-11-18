<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Legend from '#lib/components/Legend.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Wall from '#lib/components/Wall.svelte';
  import { onDate, shortDate } from '#lib/dates.ts';
  import { money, perBilling, percent, plural } from '#lib/format.ts';
  import { categories, type Category } from '#lib/data/types.ts';

  let { data } = $props();
  const { service } = $derived(data);
  const [latest] = $derived(service.changes);
  const kinds = $derived(
    (Object.keys(categories) as Category[]).filter((kind) =>
      service.changes.some(({ category }) => category === kind)
    )
  );
  const crumbs = $derived([
    { name: 'Home', path: '/' },
    { name: service.name, path: `/${service.service}` }
  ]);

  const hidden = new SvelteSet<string>();
  const toggle = (kind: string) => (hidden.has(kind) ? hidden.delete(kind) : hidden.add(kind));
</script>

<Seo
  title={data.title}
  description={data.description}
  path="/{service.service}"
  {crumbs}
  alt="{service.name}'s decline strip: {plural(
    service.changes.length,
    'change'
  )} from {data.from} to {data.to}."
/>

<header class="head">
  <Crumbs {crumbs} />
  <h1>{service.name}</h1>
  <p>
    {plural(service.changes.length, 'change')} since {data.from}, from
    <a href="/company/{data.company.id}">{data.company.name}</a>. The latest, {onDate(latest.date)}:
    <a href={latest.path}>{latest.title}</a>.
  </p>
</header>

<figure class="strip">
  <Wall
    rows={[{ id: service.service, name: service.name, path: '', changes: service.changes }]}
    from={data.from}
    to={data.to}
    today={data.today}
    big
  />
  <figcaption><Legend only={kinds} /></figcaption>
</figure>

{#if data.hasPrices}
  <section class="prices" aria-labelledby="prices">
    <h2 id="prices">What it costs now</h2>
    <table>
      <thead>
        <tr
          ><th scope="col">Plan</th><th scope="col">Now</th><th scope="col">At launch</th><th
            scope="col">Rise</th
          ></tr
        >
      </thead>
      <tbody>
        {#each data.plans as plan (plan.key)}
          <tr>
            <th scope="row">{plan.name} <span>{plan.region}</span></th>
            <td>{money(plan.now.price, plan.currency)} {perBilling[plan.billing]}</td>
            <td>{money(plan.launch.price, plan.currency)}, {shortDate(plan.launch.date)}</td>
            <td>{percent(plan.now.price / plan.launch.price - 1)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <p>
      <a href="/{service.service}/price-history"
        >{data.product} price history, every step since launch</a
      >
    </p>
  </section>
{/if}

<section class="history" aria-labelledby="every">
  <div class="bar">
    <h2 id="every">Every change, newest first</h2>
    {#if kinds.length > 1}
      <div class="filters" role="group" aria-label="Show kinds of change">
        {#each kinds as kind (kind)}
          <button
            type="button"
            aria-pressed={!hidden.has(kind)}
            style:--ink="var(--{kind})"
            onclick={() => toggle(kind)}>{categories[kind]}</button
          >
        {/each}
      </div>
    {/if}
  </div>
  {#each data.years as [year, changes] (year)}
    <section class="year" hidden={changes.every(({ category }) => hidden.has(category))}>
      <h3><a href="/year/{year}">{year}</a></h3>
      <ChangeList {changes} showService={false} {hidden} />
    </section>
  {/each}
</section>

<aside class="further" aria-labelledby="further">
  <h2 id="further">Further reading</h2>
  <ul>
    <li>
      <a href="/company/{data.company.id}">Everything from {data.company.name} in this index</a>
    </li>
    {#if service.crw}<li>
        <a href={service.crw} rel="external">{service.name} on Consumer Rights Wiki</a>
      </li>{/if}
    {#if service.wikipedia}<li>
        <a href={service.wikipedia} rel="external">{service.name} on Wikipedia</a>
      </li>{/if}
    <li><a href={service.url} rel="external">{service.name}'s own site</a></li>
  </ul>
</aside>

<style>
  .head {
    display: grid;
    gap: var(--space-3);

    & p {
      max-width: var(--measure);
      font-size: var(--text-md);
      color: var(--text-muted);
    }
  }

  .strip {
    display: grid;
    gap: var(--space-4);
    margin-block: var(--space-6) var(--space-7);
    padding-block: var(--space-5);
    border-block: var(--rule-heavy) solid var(--rule);
  }

  .prices {
    display: grid;
    gap: var(--space-4);
    margin-bottom: var(--space-7);
  }

  table {
    width: 100%;
    max-width: 48rem;
    border-collapse: collapse;

    & th,
    & td {
      padding: var(--space-2) var(--space-3) var(--space-2) 0;
      border-bottom: var(--rule-thin) solid var(--rule-faint);
      text-align: left;
      font-weight: 400;
    }

    & thead th {
      font-size: var(--text-sm);
      color: var(--text-muted);
      border-bottom-color: var(--rule);
    }

    & tbody th {
      font-weight: 650;

      & span {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }
    }
  }

  .history {
    display: grid;
    gap: var(--space-6);
  }

  .bar {
    display: grid;
    gap: var(--space-3);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);

    & button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-3);
      border: var(--rule-thin) solid var(--rule-faint);
      background: var(--surface-raised);
      font-size: var(--text-sm);
      cursor: pointer;

      &::before {
        content: '';
        width: 0.7em;
        height: 0.7em;
        background: var(--ink);
      }

      &[aria-pressed='false'] {
        color: var(--text-muted);
        background: none;
        text-decoration: line-through;

        &::before {
          background: none;
          box-shadow: inset 0 0 0 1.5px var(--ink);
        }
      }
    }
  }

  .year {
    display: grid;
    gap: var(--space-2);

    & h3 a {
      text-decoration: none;
    }

    &[hidden] {
      display: none;
    }
  }

  .further {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-7);

    & ul {
      display: grid;
      gap: var(--space-2);
      padding-left: var(--space-5);
    }
  }
</style>
