<script lang="ts">
  import { absolute, ogPage, ogSize, schemaIds, site } from '#lib/site.ts';

  export interface Crumb {
    name: string;
    path: string;
  }

  let {
    title,
    description,
    path,
    crumbs = [],
    noindex = false,
    alt,
    schema = []
  }: {
    /** what the page is, without the site name */
    title: string;
    description: string;
    path: string;
    /** where it sits, home first, ending with this page */
    crumbs?: Crumb[];
    noindex?: boolean;
    /** what the share card shows, for anyone who can't see it */
    alt?: string;
    schema?: object[];
  } = $props();

  const home = $derived(path === '/');
  const url = $derived(absolute(path));
  const image = $derived(absolute(`/og/${ogPage(path)}.png`));

  const graph = $derived([
    home && {
      '@type': 'WebSite',
      '@id': schemaIds.website,
      url: absolute('/'),
      name: site.name,
      alternateName: site.short,
      description: site.description,
      inLanguage: 'en-GB',
      publisher: { '@id': schemaIds.publisher }
    },
    home && {
      '@type': 'Organization',
      '@id': schemaIds.publisher,
      name: site.name,
      url: absolute('/'),
      logo: absolute('/logo.png'),
      sameAs: [site.repo]
    },
    crumbs.length > 1 && {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absolute(crumb.path)
      }))
    },
    ...schema
  ]);

  const json = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph.filter(Boolean)
    }).replaceAll('<', '\\u003c')
  );
</script>

<svelte:head>
  <title>{home ? title : `${title} - ${site.short}`}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={noindex ? 'noindex, follow' : 'max-image-preview:large'} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:locale" content="en_GB" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content={String(ogSize.width)} />
  <meta property="og:image:height" content={String(ogSize.height)} />
  <meta property="og:image:alt" content={alt ?? description} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image:alt" content={alt ?? description} />
  {#if graph.some(Boolean)}
    {@html `<script type="application/ld+json">${json}</script>`}
  {/if}
</svelte:head>
