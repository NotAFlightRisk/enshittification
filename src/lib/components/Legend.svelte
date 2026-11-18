<script lang="ts">
  import { categories, type Category } from '#lib/data/types.ts';

  let { only }: { only?: Category[] } = $props();

  const shown = $derived(
    (Object.keys(categories) as Category[]).filter((category) => !only || only.includes(category))
  );
</script>

<ul class="legend">
  {#each shown as category (category)}
    <li style:--ink="var(--{category})">
      <a href="/category/{category}">{categories[category]}</a>
    </li>
  {/each}
  <li class="hollow">Reversed or only tested</li>
  <li class="ahead">Not in force yet</li>
</ul>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    padding: 0;
    list-style: none;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  li {
    --ink: var(--text-muted);
    display: flex;
    align-items: center;
    gap: var(--space-2);

    &::before {
      content: '';
      width: var(--mark-width);
      height: 1.1em;
      background: var(--ink);
    }
  }

  .hollow::before {
    width: calc(var(--mark-width) * 2);
    background: none;
    box-shadow: inset 0 0 0 1.5px var(--ink);
  }

  .ahead::before {
    background: repeating-linear-gradient(var(--ink) 0 3px, transparent 3px 6px);
  }

  a {
    text-decoration: none;

    &:hover {
      color: var(--text);
      text-decoration: underline;
    }
  }
</style>
