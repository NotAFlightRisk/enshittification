<script lang="ts">
  import { categories, type Category } from '#lib/data/types.ts';

  let { category, link = false }: { category: Category; link?: boolean } = $props();
</script>

{#if link}
  <a class="tag" href="/category/{category}" style:--ink="var(--{category})"
    >{categories[category]}</a
  >
{:else}
  <span class="tag" style:--ink="var(--{category})">{categories[category]}</span>
{/if}

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    font-size: var(--text-sm);
    color: var(--text-muted);
    white-space: nowrap;
    text-decoration: none;

    &::before {
      content: '';
      width: 0.7em;
      height: 0.7em;
      background: var(--ink);
    }
  }

  a.tag:hover {
    color: var(--text);
    text-decoration: underline;
  }
</style>
