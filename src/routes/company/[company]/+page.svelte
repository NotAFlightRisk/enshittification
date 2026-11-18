<script lang="ts">
  import ListPage from '#lib/components/ListPage.svelte';

  let { data } = $props();
</script>

<ListPage
  heading={data.company.name}
  title={data.title}
  description={data.description}
  path="/company/{data.company.id}"
  crumbs={[
    { name: 'Home', path: '/' },
    { name: data.company.name, path: `/company/${data.company.id}` }
  ]}
  changes={data.changes}
  noindex={!data.indexed}
>
  <p class="links">
    {#each data.services as service (service.service)}
      <a href="/{service.service}">{service.name}</a>
    {/each}
    <a href={data.company.url} rel="external">{data.company.name}'s own site</a>
    {#if data.company.wikipedia}<a href={data.company.wikipedia} rel="external">Wikipedia</a>{/if}
  </p>
</ListPage>

<style>
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
  }
</style>
