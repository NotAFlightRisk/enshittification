<script lang="ts">
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Legend from '#lib/components/Legend.svelte';
  import Pictogram from '#lib/components/Pictogram.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Sign from '#lib/components/Sign.svelte';
  import Wall from '#lib/components/Wall.svelte';
  import { shortDate } from '#lib/dates.ts';
  import { plural } from '#lib/format.ts';
  import { site } from '#lib/site.ts';

  let { data } = $props();
  const { counts } = $derived(data);
</script>

<Seo
  title="{site.name}: every time big tech made it worse, dated and sourced"
  description="{counts.changes} price rises, new ads, paywalls, removed features and API lockdowns at {counts.services} big services since {counts.first}, each dated, sourced and archived."
  path="/"
  alt="The wall: {plural(counts.changes, 'change')} at {plural(
    counts.services,
    'service'
  )} as warning signs on a line from {counts.first} to {data.to}."
/>

<div class="hero">
  <Sign severity={1}>
    <div class="claim">
      <img src="/favicon.svg" alt="" width="128" height="128" />
      <div>
        <h1>Big tech gets worse after you sign up.</h1>
        <p>
          {plural(counts.changes, 'change')} at {plural(counts.services, 'service')} since
          {counts.first}, every one dated, sourced and archived.
        </p>
      </div>
    </div>
  </Sign>
</div>

<section class="wall" aria-labelledby="wall">
  <div class="bar">
    <h2 id="wall">The wall</h2>
    <p>One sign per change, on the day it happened.</p>
  </div>
  <Wall rows={data.rows} from={data.from} to={data.to} today={data.today} />
  <Legend />
</section>

{#if data.serious.length}
  <section aria-labelledby="serious">
    <h2 id="serious">Most serious</h2>
    <ol class="serious">
      {#each data.serious as change (change.key)}
        <li data-level="danger">
          <a href={change.path}>
            <Pictogram kind={change.category} severity={change.severity} />
            <span>{change.serviceName}, {shortDate(change.date)}</span>
            <b>{change.title}</b>
          </a>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<div class="lists">
  <section aria-labelledby="latest">
    <h2 id="latest">Latest</h2>
    <ChangeList changes={data.latest} />
    <a class="button" href="/latest">View all enshittifications</a>
  </section>

  <section aria-labelledby="coming">
    <h2 id="coming">Coming up</h2>
    {#if data.coming.length}
      <ChangeList changes={data.coming} showStatus={false} />
    {:else}
      <p>Nothing announced and not yet in force. Give it a week.</p>
    {/if}
    <a class="button" href="/random">Show me a random one</a>
  </section>
</div>

<style>
  section {
    display: grid;
    gap: var(--space-4);
    align-content: start;
    margin-top: var(--space-8);
  }

  .hero {
    max-width: 56rem;
  }

  .claim {
    display: flex;
    align-items: center;
    gap: var(--space-6);

    & img {
      flex: none;
      width: clamp(4.5rem, 14vw, 8rem);
      height: auto;
    }

    & div {
      display: grid;
      gap: var(--space-3);
    }

    & p {
      max-width: 44ch;
      font-size: var(--text-md);
    }
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2) var(--space-4);

    & p {
      color: var(--ink-soft);
    }
  }

  .serious {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: var(--space-4);
    padding: 0;
    list-style: none;

    & a {
      --sign-size: 2.5rem;
      display: grid;
      align-content: start;
      gap: var(--space-2);
      height: 100%;
      padding: var(--space-4);
      border: 2px solid var(--edge);
      border-top: 0.6rem solid var(--level);
      background: var(--paper);
      text-decoration: none;

      &:hover b {
        text-decoration: underline 2px;
      }
    }

    & span {
      font-size: var(--text-sm);
      color: var(--ink-soft);
    }

    & b {
      font-family: var(--font-sign);
      font-size: var(--text-lg);
      line-height: 1.1;
    }
  }

  .lists {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0 var(--space-7);
  }

  @media (max-width: 50rem) {
    .lists {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 40rem) {
    .claim {
      gap: var(--space-4);
      align-items: start;
    }

    h1 {
      font-size: var(--text-xl);
    }
  }
</style>
