<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Seo from '#lib/components/Seo.svelte';

  let { data } = $props();

  onMount(() => goto(data.paths[Math.floor(Math.random() * data.paths.length)], { replace: true }));
</script>

<Seo
  title="A random change"
  description="Takes you to one of the changes in the index, picked at random."
  path="/random"
  noindex
/>

<h1>Rummaging through the pile</h1>
<p>Picking one at random. If nothing happens, <a href="/latest">here's the whole lot</a>.</p>
