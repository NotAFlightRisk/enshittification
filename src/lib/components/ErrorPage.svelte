<script lang="ts">
  import Seo from '#lib/components/Seo.svelte';

  let { status }: { status: number } = $props();
  const missing = $derived(status === 404);
</script>

<Seo
  title={missing ? 'Nothing here' : 'Something broke'}
  description="This page doesn't exist, or it went the way of every free feature."
  path={missing ? '/404' : '/'}
  noindex
/>

<section class="gone">
  <h1>
    {missing
      ? 'This page has been removed to improve your experience'
      : 'Something broke on our end'}
  </h1>
  <p>
    {#if missing}
      Or it never existed. Either way, it's the most on-brand thing that could happen here. Try
      <a href="/">the wall</a>, <a href="/latest">the latest changes</a> or
      <a href="/random">a random one</a>.
    {:else}
      Not deliberately, unlike everything else on this site. Try again in a minute, or head
      <a href="/">back to the wall</a>.
    {/if}
  </p>
</section>

<style>
  .gone {
    display: grid;
    gap: var(--space-4);
    max-width: 44rem;
    padding-block: var(--space-7);

    & p {
      font-size: var(--text-md);
      color: var(--text-muted);
    }
  }
</style>
