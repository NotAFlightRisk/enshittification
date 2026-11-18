<script lang="ts">
  import Strip from '#lib/components/Strip.svelte';
  import Tally from '#lib/components/Tally.svelte';
  import { yearsBetween } from '#lib/strip.ts';
  import { plural } from '#lib/format.ts';
  import type { Entry } from '#lib/data/types.ts';

  let {
    rows,
    from,
    to,
    today,
    big = false
  }: {
    rows: { id: string; name: string; path: string; changes: Entry[] }[];
    from: number;
    to: number;
    today: string;
    big?: boolean;
  } = $props();

  const years = $derived(yearsBetween(from, to));
  // labels every other year once there are too many to fit on a phone
  const sparse = $derived(years.length > 8);
</script>

<div class="wall" class:big style:--years={years.length}>
  {#each rows as row (row.id)}
    <div class="row">
      {#if !big}
        <a class="name" href={row.path}>{row.name}</a>
        <span class="count" title={plural(row.changes.length, 'change')}>
          <Tally count={row.changes.length} />
          <span>{row.changes.length}</span>
        </span>
      {/if}
      <div class="line">
        <Strip changes={row.changes} {from} {to} {today} name={row.name} {big} />
      </div>
    </div>
  {/each}
  <div class="axis" aria-hidden="true">
    <ol>
      {#each years as year, index (year)}
        <li class:minor={sparse && index % 2 === 1}>{year}</li>
      {/each}
    </ol>
  </div>
</div>

<style>
  .wall {
    --name: 9rem;
    --count: 5.5rem;
    display: grid;
    gap: var(--space-2);

    &.big {
      --name: 0rem;
      --count: 0rem;
    }
  }

  .row,
  .axis {
    display: grid;
    grid-template-columns: var(--name) 1fr var(--count);
    align-items: center;
    column-gap: var(--space-4);
  }

  .big .row,
  .big .axis {
    column-gap: 0;
  }

  .name {
    font-weight: 750;
    text-decoration: none;
    overflow-wrap: anywhere;

    &:hover {
      text-decoration: underline;
    }
  }

  .line {
    grid-column: 2;
    grid-row: 1;
    background:
      linear-gradient(var(--rule-faint), var(--rule-faint)) 0 50% / 100% 1px no-repeat,
      repeating-linear-gradient(
        to right,
        var(--rule-faint) 0 1px,
        transparent 1px calc(100% / var(--years))
      );
  }

  .count {
    grid-column: 3;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  .axis {
    font-size: var(--text-xs);
    color: var(--text-muted);

    & ol {
      grid-column: 2;
      display: grid;
      grid-template-columns: repeat(var(--years), 1fr);
      padding: 0;
      list-style: none;
    }

    & li {
      padding-left: var(--space-1);
      border-left: var(--rule-thin) solid var(--rule-faint);
    }
  }

  .big .axis {
    font-size: var(--text-sm);
  }

  @media (max-width: 40rem) {
    .wall:not(.big) .row {
      grid-template-columns: 1fr auto;
      row-gap: var(--space-1);

      & .line {
        grid-column: 1 / -1;
        grid-row: 2;
      }

      & .count {
        grid-column: 2;
      }
    }

    .wall:not(.big) .axis {
      grid-template-columns: 1fr;

      & ol {
        grid-column: 1;
      }
    }

    .minor {
      color: transparent;
    }
  }
</style>
