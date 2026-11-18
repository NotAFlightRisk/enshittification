<script lang="ts">
  import ListPage from '#lib/components/ListPage.svelte';
  import { plural } from '#lib/format.ts';

  let { data } = $props();
</script>

<ListPage
  heading="Latest"
  title="The latest anti-user changes at big tech services, newest first"
  description="All {plural(
    data.changes.length,
    'change'
  )} in the index, newest first, including the ones announced and not in force yet. There's an Atom feed too."
  path="/latest"
  crumbs={[
    { name: 'Home', path: '/' },
    { name: 'Latest', path: '/latest' }
  ]}
  changes={data.changes}
>
  <p><a href="/feed.xml">Follow it in a feed reader</a></p>
</ListPage>
