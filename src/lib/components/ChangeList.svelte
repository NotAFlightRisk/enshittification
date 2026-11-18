<script lang="ts">
  import Pictogram from '#lib/components/Pictogram.svelte';
  import { shortDate } from '#lib/dates.ts';
  import {
    categories,
    isHollow,
    levelOf,
    severities,
    statuses,
    type Entry
  } from '#lib/data/types.ts';

  let {
    changes,
    showService = true,
    showStatus = true,
    hidden = new Set()
  }: {
    changes: Entry[];
    showService?: boolean;
    showStatus?: boolean;
    hidden?: Set<string>;
  } = $props();
</script>

<ol class="changes">
  {#each changes as change (change.key)}
    <li hidden={hidden.has(change.category)}>
      <Pictogram kind={change.category} severity={change.severity} status={change.status} />
      <time datetime={change.date}>{shortDate(change.date)}</time>
      <div class="what">
        <a href={change.path}>
          {#if showService && !change.title.startsWith(change.serviceName)}<b
              >{change.serviceName}</b
            >{/if}
          {change.title}
        </a>
        <p class="meta">
          <span>{categories[change.category]}</span>
          <span
            class="level"
            class:danger={change.severity === 3 && !isHollow(change.status)}
            data-level={levelOf(change.severity)}>{severities[change.severity].name}</span
          >
          {#if showStatus && change.status !== 'in-force'}
            <span class="status">{statuses[change.status]}</span>
          {/if}
        </p>
      </div>
    </li>
  {/each}
</ol>

<style>
  .changes {
    container-type: inline-size;
    padding: 0;
    list-style: none;
    border-top: 2px solid var(--ink);
  }

  li {
    --sign-size: 1.75rem;
    display: grid;
    grid-template-columns: var(--sign-size) 6.5rem 1fr;
    align-items: start;
    gap: var(--space-1) var(--space-4);
    padding-block: var(--space-3);
    border-bottom: var(--thin) solid var(--line);

    &[hidden] {
      display: none;
    }
  }

  time {
    padding-top: 0.2em;
    font-family: var(--font-sign);
    font-size: var(--text-md);
    font-weight: 600;
    line-height: 1.2;
  }

  .what {
    display: grid;
    gap: var(--space-1);
  }

  a {
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline 2px;
    }
  }

  b {
    font-weight: 700;
    margin-right: 0.25em;

    &::after {
      content: ':';
    }
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    color: var(--ink-soft);
  }

  .level,
  .status {
    font-family: var(--font-sign);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .danger,
  .status {
    padding: 0 var(--space-2);
  }

  .danger {
    background: var(--level);
    color: var(--on-level);
  }

  .status {
    border: var(--thin) solid var(--ink-soft);
  }

  @container (max-width: 36rem) {
    li {
      grid-template-columns: var(--sign-size) 1fr;
      row-gap: 0;
    }

    time {
      padding-top: 0;
      font-size: var(--text-base);
    }

    li > :global(svg) {
      grid-row: span 2;
    }

    .what {
      grid-column: 2;
    }
  }
</style>
