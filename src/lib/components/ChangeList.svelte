<script lang="ts">
  import Tag from '#lib/components/Tag.svelte';
  import { shortDate } from '#lib/dates.ts';
  import { statuses, type Entry } from '#lib/data/types.ts';

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
      <time datetime={change.date}>{shortDate(change.date)}</time>
      <Tag category={change.category} />
      <a href={change.path}>
        {#if showService && !change.title.startsWith(change.serviceName)}<b>{change.serviceName}</b
          >{/if}
        {change.title}
      </a>
      {#if showStatus && change.status !== 'in-force'}
        <span class="status">{statuses[change.status]}</span>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .changes {
    container-type: inline-size;
    padding: 0;
    list-style: none;
    border-top: var(--rule-thin) solid var(--rule-faint);
  }

  li {
    display: grid;
    grid-template-columns: 7.5rem 9.5rem 1fr auto;
    align-items: baseline;
    gap: var(--space-1) var(--space-4);
    padding-block: var(--space-3);
    border-bottom: var(--rule-thin) solid var(--rule-faint);

    &[hidden] {
      display: none;
    }
  }

  time,
  .status {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  a {
    text-decoration: none;
    font-weight: 550;

    &:hover {
      text-decoration: underline;
    }
  }

  b {
    font-weight: 750;
    margin-right: 0.25em;

    &::after {
      content: ':';
    }
  }

  .status {
    padding-inline: var(--space-2);
    border: var(--rule-thin) solid var(--rule-faint);
  }

  @container (max-width: 36rem) {
    li {
      grid-template-columns: auto 1fr;

      & a {
        grid-column: 1 / -1;
      }

      & .status {
        justify-self: start;
      }
    }
  }
</style>
