<script lang="ts">
  import Pictogram from '#lib/components/Pictogram.svelte';
  import { formatDate, shortDate, yearOf } from '#lib/dates.ts';
  import { nouns } from '#lib/seo.ts';
  import type { LogMonth } from '#lib/incidents.ts';

  let { months }: { months: LogMonth[] } = $props();
</script>

<section class="log" aria-labelledby="incident-log">
  <h2 id="incident-log">Incident log</h2>

  <ol>
    {#each months as { month, serious, more, minor } (month)}
      <li class="month">
        <h3><a href="/year/{yearOf(month)}">{formatDate(month)}</a></h3>
        <div class="entries">
          {#if serious.length}
            <ul class="serious">
              {#each serious as change (change.key)}
                <li>
                  <a href={change.path}>
                    <Pictogram
                      kind={change.category}
                      severity={change.severity}
                      status={change.status}
                    />
                    <span>{change.serviceName}, {shortDate(change.date)}</span>
                    <b>{change.title}</b>
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
          {#if more}
            <a class="more" href="/year/{yearOf(month)}">
              and {more} more serious {more === 1 ? 'one' : 'ones'}
            </a>
          {/if}
          {#if minor.length}
            <ul class="minor">
              {#each minor as { category, count, path } (category)}
                <li>
                  <a href={path}>
                    <Pictogram kind={category} severity={1} />
                    {count}
                    {nouns[category][count === 1 ? 0 : 1]}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </li>
    {/each}
  </ol>

  <a class="button" href="/the-wall">See it all on the wall</a>
</section>

<style>
  .log {
    display: grid;
    align-content: start;
    gap: var(--space-4);

    & a {
      text-decoration: none;
    }

    & > ol {
      padding: 0;
      list-style: none;
      border-top: var(--medium) solid var(--ink);
    }
  }

  .month {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    gap: var(--space-2) var(--space-4);
    padding-block: var(--space-3);
    border-bottom: var(--thin) solid var(--line);
  }

  h3 {
    font-size: var(--text-md);
    line-height: 1.15;

    & a:hover {
      text-decoration: underline 2px;
    }
  }

  .entries {
    display: grid;
    gap: var(--space-2);
  }

  .serious {
    display: grid;
    gap: var(--space-3);
    padding: 0;
    list-style: none;

    & a {
      --sign-size: 2rem;
      display: grid;
      grid-template-columns: var(--sign-size) minmax(0, 1fr);
      column-gap: var(--space-3);
      line-height: 1.3;

      & > :global(svg) {
        grid-row: span 2;
      }

      &:hover b {
        text-decoration: underline 2px;
      }
    }

    & span {
      font-size: var(--text-sm);
      color: var(--ink-soft);
    }

    & b {
      font-weight: 600;
    }
  }

  .more,
  .minor a {
    font-size: var(--text-sm);
    color: var(--ink-soft);

    &:hover {
      color: var(--ink);
      text-decoration: underline;
    }
  }

  .more {
    justify-self: start;
  }

  .minor {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-4);
    padding: 0;
    list-style: none;

    & a {
      --sign-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
  }

  @media (max-width: 40rem) {
    .month {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
