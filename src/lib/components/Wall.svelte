<script lang="ts">
  import Strip from '#lib/components/Strip.svelte';
  import { yearsBetween } from '#lib/strip.ts';
  import { yearOf } from '#lib/dates.ts';
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
  const perYear = $derived(
    Map.groupBy(
      rows.flatMap(({ changes }) => changes),
      ({ date }) => yearOf(date)
    )
  );
</script>

<div class="wall" class:big style:--years={years.length}>
  {#each rows as row (row.id)}
    <div class="row">
      {#if !big}
        <p class="who">
          <a href={row.path}>{row.name}</a>
          <span>{plural(row.changes.length, 'change')}</span>
        </p>
      {/if}
      <div class="line">
        <Strip changes={row.changes} {from} {to} {today} name={row.name} {big} />
      </div>
    </div>
  {/each}
  <div class="row axis" aria-hidden="true">
    <ol>
      {#each years as year (year)}
        <li>
          <span class="full">{year}</span>
          <span class="short">{String(year).slice(2)}</span>
          {#if !big}<small>{perYear.get(year)?.length ?? 0}</small>{/if}
        </li>
      {/each}
    </ol>
  </div>
</div>

<style>
  .wall {
    --name: 9rem;
    display: grid;
    gap: var(--space-3);

    &.big {
      --name: 0rem;
    }
  }

  .row {
    display: grid;
    grid-template-columns: var(--name) minmax(0, 1fr);
    align-items: end;
    column-gap: var(--space-4);
  }

  .big .row {
    column-gap: 0;
  }

  .who {
    display: grid;
    padding-bottom: var(--space-2);
    line-height: 1.1;

    & a {
      font-family: var(--font-sign);
      font-size: var(--text-lg);
      font-weight: 700;
      text-decoration: none;
      overflow-wrap: anywhere;

      &:hover {
        text-decoration: underline 2px;
      }
    }

    & span {
      font-size: var(--text-sm);
      color: var(--ink-soft);
    }
  }

  .line {
    grid-column: 2;
    background: repeating-linear-gradient(
      to right,
      var(--line) 0 1px,
      transparent 1px calc(100% / var(--years))
    );
  }

  .axis {
    font-family: var(--font-sign);
    font-size: var(--text-md);
    font-weight: 700;
    line-height: 1.1;

    & ol {
      grid-column: 2;
      display: grid;
      grid-template-columns: repeat(var(--years), minmax(0, 1fr));
      padding: 0;
      list-style: none;
    }

    & li {
      display: grid;
      overflow: hidden;
      padding-left: var(--space-1);
      border-left: var(--thin) solid var(--line);
    }

    & small {
      font-family: var(--font-body);
      font-size: var(--text-xs);
      font-weight: 400;
      color: var(--ink-soft);
    }

    & .short {
      display: none;
    }
  }

  @media (max-width: 40rem) {
    .wall:not(.big) .row {
      grid-template-columns: minmax(0, 1fr);

      & .line,
      & ol {
        grid-column: 1;
      }
    }

    .who {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .axis {
      font-size: var(--text-sm);

      & li {
        padding-left: 2px;
      }

      & .full {
        display: none;
      }

      & .short {
        display: inline;
      }
    }
  }
</style>
