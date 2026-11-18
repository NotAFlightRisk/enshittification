<script lang="ts">
  import type { Snippet } from 'svelte';
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo, { type Crumb } from '#lib/components/Seo.svelte';
  import type { Entry } from '#lib/data/types.ts';

  let {
    heading,
    title,
    description,
    path,
    crumbs,
    changes,
    noindex = false,
    children
  }: {
    heading: string;
    title: string;
    description: string;
    path: string;
    crumbs: Crumb[];
    changes: Entry[];
    noindex?: boolean;
    children?: Snippet;
  } = $props();
</script>

<Seo {title} {description} {path} {crumbs} {noindex} />

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>{heading}</h1>
  <p>{description}</p>
  {@render children?.()}
</header>

<ChangeList {changes} />
