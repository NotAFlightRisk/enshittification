<script lang="ts">
  import ListPage from '#lib/components/ListPage.svelte';

  let { data } = $props();
</script>

<ListPage
  heading="What got worse in {data.year}"
  title={data.title}
  description={data.description}
  path="/year/{data.year}"
  crumbs={[
    { name: 'Home', path: '/' },
    { name: String(data.year), path: `/year/${data.year}` }
  ]}
  changes={data.changes}
  noindex={!data.indexed}
>
  <p class="links">
    {#if data.previous}<a href="/year/{data.previous}">{data.previous}</a>{/if}
    {#if data.next}<a href="/year/{data.next}">{data.next}</a>{/if}
  </p>
</ListPage>

<style>
  .links {
    display: flex;
    gap: var(--space-4);
  }
</style>
