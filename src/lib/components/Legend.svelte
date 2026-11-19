<script lang="ts">
  import Tag from '#lib/components/Tag.svelte';
  import { categories, levelKeys, levels, type Category } from '#lib/data/types.ts';

  let { only }: { only?: Category[] } = $props();

  const shown = $derived(
    (Object.keys(categories) as Category[]).filter((category) => !only || only.includes(category))
  );
</script>

<div class="legend">
  <ul aria-label="Kinds of change">
    {#each shown as category (category)}
      <li><Tag {category} link /></li>
    {/each}
  </ul>
  <ul aria-label="How bad, and when">
    {#each levelKeys as level (level)}
      <li title={levels[level].means}>
        <span class="swatch" data-level={level}></span>{levels[level].name}
      </li>
    {/each}
    <li><span class="swatch"></span>Reversed or only tested</li>
    <li><span class="swatch ahead"></span>Not in force yet</li>
    <li><span class="today"></span>Today</li>
  </ul>
</div>

<style>
  .legend {
    display: grid;
    gap: var(--space-3);
    font-size: var(--text-sm);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .today {
    height: 1.3em;
    border-left: 2px dashed var(--danger);
  }
</style>
