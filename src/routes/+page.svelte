<script lang="ts">
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Legend from '#lib/components/Legend.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Wall from '#lib/components/Wall.svelte';
  import { plural } from '#lib/format.ts';
  import { site } from '#lib/site.ts';

  let { data } = $props();
  const { counts } = $derived(data);
</script>

<Seo
  title="{site.name}: every time big tech made it worse, dated and sourced"
  description="{counts.changes} price rises, new ads, paywalls, removed features and API lockdowns at {counts.services} big services since {counts.first}, each dated, sourced and archived."
  path="/"
  alt="The decline wall: {plural(counts.changes, 'change')} at {plural(
    counts.services,
    'service'
  )} marked on a line from {counts.first} to {data.to}."
/>

<header class="intro">
  <h1>
    Every time big tech made it <del aria-hidden="true">better</del> worse, dated and sourced.
  </h1>
  <p>
    {plural(counts.changes, 'change')} at {plural(counts.services, 'service')} since {counts.first}:
    price rises, new ads, paywalls, removed features and API lockdowns. Each one has the date, what
    the company said, and its sources with an archived copy, so you can check it yourself.
  </p>
</header>

<figure class="wall" id="wall">
  <Wall rows={data.rows} from={data.from} to={data.to} today={data.today} />
  <figcaption>
    <p>
      Each mark is one change in this index, coloured by kind. It's what's been logged so far, not a
      measure of how bad anything got.
    </p>
    <Legend />
  </figcaption>
</figure>

<div class="lists">
  <section aria-labelledby="latest">
    <h2 id="latest">Latest</h2>
    <ChangeList changes={data.latest} />
    <p class="more"><a href="/latest">Everything, newest first</a></p>
  </section>

  <section aria-labelledby="coming">
    <h2 id="coming">Coming up</h2>
    {#if data.coming.length}
      <ChangeList changes={data.coming} />
    {:else}
      <p class="empty">Nothing announced and not yet in force. Give it a week.</p>
    {/if}
    <a class="random" href="/random">Show me a random one</a>
  </section>
</div>

<style>
  .intro {
    display: grid;
    gap: var(--space-4);
    max-width: 56rem;

    & del {
      color: var(--text-muted);
      text-decoration-color: var(--accent);
      text-decoration-thickness: 0.09em;
    }

    & p {
      max-width: var(--measure);
      font-size: var(--text-md);
      color: var(--text-muted);
    }
  }

  .wall {
    display: grid;
    gap: var(--space-5);
    margin-block: var(--space-7);
    padding-block: var(--space-6);
    border-block: var(--rule-heavy) solid var(--rule);

    & figcaption {
      display: grid;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  }

  .lists {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: var(--space-7);

    & section {
      display: grid;
      gap: var(--space-4);
      align-content: start;
    }
  }

  .more,
  .empty {
    color: var(--text-muted);
  }

  .random {
    justify-self: start;
    padding: var(--space-3) var(--space-4);
    border: var(--rule-thin) solid var(--rule);
    font-weight: 700;
    text-decoration: none;
    transition: background var(--quick) var(--ease);

    &:hover {
      background: var(--accent-soft);
    }
  }

  @media (max-width: 60rem) {
    .lists {
      grid-template-columns: 1fr;
    }
  }
</style>
