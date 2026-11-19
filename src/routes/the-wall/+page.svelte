<script lang="ts">
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Legend from '#lib/components/Legend.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Wall from '#lib/components/Wall.svelte';
  import { plural } from '#lib/format.ts';

  let { data } = $props();
  const { counts } = $derived(data);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'The wall', path: '/the-wall' }
  ];
  const description = $derived(
    `All ${plural(counts.changes, 'change')} at ${plural(counts.services, 'service')} since ${counts.first}, a row per service with the worst at the top.`
  );
</script>

<Seo title="The wall: every service and every change" {description} path="/the-wall" {crumbs} />

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>The wall</h1>
  <p>{description}</p>
</header>

<section aria-label="Every service">
  <Wall {...data.wall} />
  <Legend />
</section>

<style>
  section {
    display: grid;
    gap: var(--space-4);
  }
</style>
