<script lang="ts">
  import ListPage from '#lib/components/ListPage.svelte';

  let { data } = $props();
</script>

<ListPage
  heading={data.heading}
  title={data.title}
  description={data.description}
  path="/category/{data.category}"
  crumbs={[
    { name: 'Home', path: '/' },
    { name: data.heading, path: `/category/${data.category}` }
  ]}
  changes={data.changes}
  noindex={!data.indexed}
/>
