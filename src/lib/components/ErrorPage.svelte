<script lang="ts">
  import Seo from '#lib/components/Seo.svelte';
  import Sign from '#lib/components/Sign.svelte';

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
  <Sign level={missing ? 'warning' : 'danger'}>
    <h1>
      {missing
        ? 'This page has been removed to improve your experience'
        : 'Something broke on our end'}
    </h1>
    <p>
      {#if missing}
        Or it never existed. Try <a href="/the-wall">the wall</a>,
        <a href="/latest">the latest changes</a>
        or <a href="/random">a random one</a>.
      {:else}
        Not deliberately, unlike everything else on this site. Try again in a minute, or head
        <a href="/the-wall">back to the wall</a>.
      {/if}
    </p>
  </Sign>
</section>

<style>
  .gone {
    max-width: 48rem;
    padding-block: var(--space-6);

    & h1 {
      font-size: var(--text-xl);
    }

    & p {
      margin-top: var(--space-4);
      font-size: var(--text-md);
    }
  }
</style>
