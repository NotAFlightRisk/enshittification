<script lang="ts">
  import type { Crumb } from '#lib/components/Seo.svelte';

  let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav class="crumbs" aria-label="Breadcrumb">
  <ol>
    {#each crumbs.slice(0, -1) as crumb (crumb.path)}
      <li><a href={crumb.path}>{crumb.name}</a></li>
    {/each}
  </ol>
</nav>

<style>
  ol {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: 0;
    list-style: none;
    font-size: var(--text-sm);
    color: var(--ink-soft);
  }

  li:not(:last-child)::after {
    content: '/';
    margin-left: var(--space-2);
  }

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline 2px;
    }
  }
</style>
