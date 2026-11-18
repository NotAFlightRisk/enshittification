<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Facts from '#lib/components/Facts.svelte';
  import Legend from '#lib/components/Legend.svelte';
  import Pictogram from '#lib/components/Pictogram.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Sign from '#lib/components/Sign.svelte';
  import Wall from '#lib/components/Wall.svelte';
  import { formatDate } from '#lib/dates.ts';
  import { plural } from '#lib/format.ts';
  import { categories, type Category } from '#lib/data/types.ts';

  let { data } = $props();
  const { service, worst } = $derived(data);
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
  alt="{service.name}'s wall: {plural(
    service.changes.length,
    'change'
  )} as warning signs from {data.from} to {data.to}."
/>

<header class="head">
  <Crumbs {crumbs} />
  <h1>{service.name}</h1>
  <p>
    Owned by <a href="/company/{data.company.id}">{data.company.name}</a>.
    {plural(service.changes.length, 'change')} since {data.from}.
  </p>
</header>

{#if worst}
  <div class="worst">
    <Sign severity={worst.severity}>
      <a class="headline" href={worst.path}>
        <Pictogram kind={worst.category} severity={worst.severity} />
        {worst.title}
      </a>
      <p>{formatDate(worst.date)}, {categories[worst.category].toLowerCase()}</p>
    </Sign>
  </div>
{/if}

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

<div class="split">
  <div class="side">
    <Facts
      name={service.name}
      owner={data.company.name}
      from={data.from}
      changes={service.changes}
      plans={data.plans}
      history={data.hasPrices ? `/${service.service}/price-history` : undefined}
    />
  </div>

  <section class="history" aria-labelledby="every">
    <h2 id="every">Every change, newest first</h2>
    {#if kinds.length > 1}
      <div class="filters" role="group" aria-label="Show kinds of change">
        {#each kinds as kind (kind)}
          <button type="button" aria-pressed={!hidden.has(kind)} onclick={() => toggle(kind)}>
            <Pictogram {kind} />{categories[kind]}
          </button>
        {/each}
      </div>
    {/if}
    {#each data.years as [year, changes] (year)}
      <section class="year" hidden={changes.every(({ category }) => hidden.has(category))}>
        <h3><a href="/year/{year}">{year}</a></h3>
        <ChangeList {changes} showService={false} {hidden} />
      </section>
    {/each}
  </section>
</div>

<aside class="further" aria-labelledby="further">
  <h2 id="further">Further reading</h2>
  <ul>
    <li>
      <a href="/company/{data.company.id}">Everything from {data.company.name}</a>
    </li>
    {#if service.crw}
      <li><a href={service.crw} rel="external">{service.name} on Consumer Rights Wiki</a></li>
    {/if}
    {#if service.wikipedia}
      <li><a href={service.wikipedia} rel="external">{service.name} on Wikipedia</a></li>
    {/if}
    <li><a href={service.url} rel="external">{service.name}'s own site</a></li>
  </ul>
</aside>

<style>
  .head {
    display: grid;
    gap: var(--space-3);

    & p {
      font-size: var(--text-md);
      color: var(--ink-soft);
    }
  }

  .worst {
    max-width: 56rem;
    margin-top: var(--space-6);

    & p {
      margin-top: var(--space-2);
      color: var(--ink-soft);
    }
  }

  .headline {
    --sign-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    font-family: var(--font-sign);
    font-size: var(--text-xl);
    font-weight: 700;
    line-height: 1.05;
    text-decoration: none;

    &:hover {
      text-decoration: underline 3px;
    }
  }

  .strip {
    display: grid;
    gap: var(--space-5);
    margin-block: var(--space-7);
  }

  .split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 22rem;
    grid-template-areas: 'history side';
    gap: var(--space-7);
    align-items: start;
  }

  .side {
    grid-area: side;
  }

  .history {
    grid-area: history;
    display: grid;
    gap: var(--space-5);
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
      border: var(--medium) solid var(--ink);
      background: var(--paper);
      font-weight: 600;
      cursor: pointer;

      &[aria-pressed='false'] {
        border-style: dashed;
        background: none;
        color: var(--ink-soft);
        text-decoration: line-through;
      }
    }
  }

  .year {
    display: grid;
    gap: var(--space-2);

    & h3 a {
      text-decoration: none;

      &:hover {
        text-decoration: underline 2px;
      }
    }

    &[hidden] {
      display: none;
    }
  }

  .further {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-7);

    & h2 {
      font-size: var(--text-lg);
    }

    & ul {
      display: grid;
      gap: var(--space-2);
      padding-left: var(--space-5);
    }
  }

  @media (max-width: 56rem) {
    .split {
      grid-template-columns: 1fr;
      grid-template-areas: 'side' 'history';
    }
  }

  @media (max-width: 40rem) {
    .headline {
      --sign-size: 2rem;
      font-size: var(--text-lg);
    }
  }
</style>
