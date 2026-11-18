<script lang="ts">
  import Pictogram from '#lib/components/Pictogram.svelte';
  import { categories, type Category } from '#lib/data/types.ts';

  let { category, link = false }: { category: Category; link?: boolean } = $props();
</script>

<svelte:element
  this={link ? 'a' : 'span'}
  class="tag"
  href={link ? `/category/${category}` : undefined}
>
  <Pictogram kind={category} />{categories[category]}
</svelte:element>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.45em;
    white-space: nowrap;
    text-decoration: none;
  }

  a.tag:hover {
    text-decoration: underline 2px;
  }
</style>
