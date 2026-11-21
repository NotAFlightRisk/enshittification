<script lang="ts">
  import { onMount } from 'svelte';
  import Plates from '#lib/components/Plates.svelte';
  import { today } from '#lib/dates.ts';
  import { daysBetween, type Board, type Brief, type Reset } from '#lib/incidents.ts';

  let {
    last,
    counters,
    best,
    built
  }: { last: Brief; counters: Board['counters']; best: Board['best']; built: string } = $props();

  const labels: Record<Reset, string> = {
    'price-rise': 'since a price rise',
    ads: 'since new ads',
    loss: 'since something got taken away'
  };

  // the page is built ahead of time, so the counters catch up once it's open
  let opened = $state<string>();
  const now = $derived(opened ?? built);
  onMount(() => (opened = today()));

  const since = (date: string) => daysBetween(date, now);
  const days = (count: number) => (count === 1 ? 'day' : 'days');
  const streak = $derived(since(last.date));
</script>

<section class="board on-sign" aria-labelledby="days-since">
  <h2 id="days-since">Enshittification-free days</h2>

  <a class="streak" href={last.path}>
    <span class="label">Big tech has gone</span>
    <Plates value={streak} big />
    <span class="label">{days(streak)} without making something worse.</span>
    <small class="label">Last reset: {last.title}</small>
  </a>

  <ul>
    {#each counters as { id, change } (id)}
      {@const count = since(change.date)}
      <li>
        <a href={change.path}>
          <Plates value={count} />
          <span class="label">{days(count)} {labels[id]}</span>
        </a>
      </li>
    {/each}
  </ul>

  {#if best.ended}
    <p class="record">
      {#if streak > best.days}
        <a href="/the-wall">Five-year record: this one. Don't get used to it.</a>
      {:else}
        <a href={best.ended.path}>
          Five-year record: {best.days} days, until {best.ended.serviceName} ruined it.
        </a>
      {/if}
    </p>
  {/if}
</section>

<style>
  .board {
    display: grid;
    align-content: start;
    overflow: hidden;
    border: var(--thick) solid var(--edge);
    border-radius: 0.75rem;

    & a {
      text-decoration: none;

      &:hover .label {
        text-decoration: underline 2px;
      }
    }
  }

  h2 {
    padding: var(--space-2) var(--space-5);
    border-bottom: var(--band) solid;
    border-image: var(--tape) 1;
    background: var(--edge);
    color: var(--blank);
    font-size: var(--text-lg);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .streak {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    padding: var(--space-5);
    font-family: var(--font-sign);
    font-size: var(--text-xl);
    font-weight: 700;
    line-height: 1.1;
    text-align: center;
    text-wrap: balance;

    & small {
      font-family: var(--font-body);
      font-size: var(--text-sm);
      font-weight: 400;
      line-height: 1.4;
      color: var(--ink-soft);
    }
  }

  ul {
    padding: 0;
    list-style: none;
    border-top: var(--medium) solid var(--edge);

    & a {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-5);
      border-bottom: var(--thin) solid var(--line);
      font-weight: 600;
      line-height: 1.25;
    }
  }

  .record {
    padding: var(--space-3) var(--space-5) var(--space-4);
    font-size: var(--text-sm);
    color: var(--ink-soft);

    & a:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 40rem) {
    h2 {
      padding-inline: var(--space-4);
      font-size: var(--text-md);
    }

    .streak {
      padding: var(--space-4);
      font-size: var(--text-lg);
    }

    ul a,
    .record {
      padding-inline: var(--space-4);
    }
  }
</style>
