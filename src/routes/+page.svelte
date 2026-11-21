<script lang="ts">
  import ChangeList from '#lib/components/ChangeList.svelte';
  import DaysSince from '#lib/components/DaysSince.svelte';
  import IncidentLog from '#lib/components/IncidentLog.svelte';
  import Pictogram from '#lib/components/Pictogram.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Sign from '#lib/components/Sign.svelte';
  import { shortDate } from '#lib/dates.ts';
  import { plural } from '#lib/format.ts';
  import { site } from '#lib/site.ts';

  let { data } = $props();
  const { counts, board, log } = $derived(data);
</script>

<Seo
  title="{site.name}: every time big tech made it worse, dated and sourced"
  description="{counts.changes} price rises, new ads, paywalls, removed features and API lockdowns at {counts.services} big services since {counts.first}, each dated, sourced and archived."
  path="/"
  alt="The wall: {plural(counts.changes, 'change')} at {plural(
    counts.services,
    'service'
  )} as warning signs on a line from {data.span.from} to {data.span.to}."
/>

<div class="hero">
  <Sign level="caution">
    <div class="claim">
      <img src="/icon.svg" alt="" width="128" height="128" />
      <h1>Big tech gets worse after you sign up.</h1>
    </div>
  </Sign>
</div>

<div class="incidents">
  {#if board.last}
    <DaysSince last={board.last} counters={board.counters} best={board.best} built={data.built} />
  {/if}
  {#if log.length}
    <IncidentLog months={log} />
  {/if}
</div>

{#if data.serious.length}
  <section aria-labelledby="serious">
    <h2 id="serious">It's shit now</h2>
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

  .incidents {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
    align-items: start;
    gap: var(--space-7);
    margin-top: var(--space-8);
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
      border: var(--medium) solid var(--edge);
      border-top: var(--band) solid var(--level);
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
