<script lang="ts">
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Tag from '#lib/components/Tag.svelte';
  import { formatDate, shortDate, yearOf } from '#lib/dates.ts';
  import { categories, statuses } from '#lib/data/types.ts';
  import { absolute, correctionUrl, editUrl } from '#lib/site.ts';

  let { data } = $props();
  const { entry } = $derived(data);
  const kinds = {
    primary: 'from the company',
    press: 'press',
    'pricing-page': 'archived pricing page'
  };
  const dateKinds = {
    announced: 'announced',
    effective: 'took effect',
    reported: 'first reported'
  };
  const crumbs = $derived([
    { name: 'Home', path: '/' },
    { name: entry.serviceName, path: `/${entry.service}` },
    { name: entry.title, path: entry.path }
  ]);
  const schema = $derived([
    {
      '@type': 'WebPage',
      '@id': absolute(entry.path),
      url: absolute(entry.path),
      name: entry.title,
      description: data.description,
      inLanguage: 'en-GB',
      about: { '@type': 'Thing', name: entry.serviceName },
      citation: entry.sources.map((source) => ({
        '@type': 'CreativeWork',
        url: source.url,
        publisher: { '@type': 'Organization', name: source.publisher },
        datePublished: source.published
      }))
    }
  ]);
</script>

<Seo
  title={data.title}
  description={data.description}
  path={entry.path}
  {crumbs}
  noindex={!data.indexed}
  alt="{entry.title}, {formatDate(entry.date)}{entry.before && entry.after
    ? `: ${entry.before} before, ${entry.after} after`
    : ''}."
  {schema}
/>

<article class="change" style:--ink="var(--{entry.category})">
  <header class="head">
    <Crumbs {crumbs} />
    <h1>{entry.title}</h1>
    <p class="answer">{entry.what_changed}</p>
    <dl class="facts">
      <div>
        <dt>When</dt>
        <dd>
          <time datetime={entry.date}>{formatDate(entry.date)}</time>, {dateKinds[
            entry.date_kind
          ]}{#if entry.effective}, in force from {formatDate(entry.effective)}{/if}
        </dd>
      </div>
      <div>
        <dt>Kind</dt>
        <dd><Tag category={entry.category} link /></dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{statuses[entry.status]}</dd>
      </div>
      <div>
        <dt>Where</dt>
        <dd>{entry.regions?.join(', ') ?? 'Everywhere'}</dd>
      </div>
    </dl>
  </header>

  {#if entry.before || entry.after}
    <section class="panel" aria-label="Before and after">
      <div>
        <h2>Before</h2>
        <p class="was">{entry.before ?? 'Not recorded'}</p>
      </div>
      <div>
        <h2>After</h2>
        <p>{entry.after ?? 'Not recorded'}</p>
      </div>
    </section>
  {/if}

  <section class="body">
    <h2>Who it hit</h2>
    <p>{entry.user_impact}</p>
    {#if entry.company_said}
      <h2>What {data.company.name} said</h2>
      <blockquote><p>{entry.company_said}</p></blockquote>
    {/if}
    {#if entry.reversed}
      <h2>Reversed, {formatDate(entry.reversed.date)}</h2>
      <p>{entry.reversed.what}</p>
    {/if}
  </section>

  <section class="sources" aria-labelledby="sources">
    <h2 id="sources">Sources</h2>
    <ol>
      {#each [...entry.sources, ...(entry.reversed?.sources ?? [])] as source (source.url)}
        <li>
          <p class="who">
            <b>{source.publisher}</b>, {kinds[source.kind]}, {shortDate(source.published)}
          </p>
          <blockquote cite={source.url}><p>"{source.quote}"</p></blockquote>
          <p class="links">
            <a href={source.url} rel="external nofollow">Read it</a>
            {#if source.archive.startsWith('https://')}
              <a href={source.archive} rel="external nofollow">Archived copy</a>
            {:else if source.archive === 'blocked'}
              <span>The site blocks the archive</span>
            {:else}
              <span>Archive copy on its way</span>
            {/if}
          </p>
        </li>
      {/each}
    </ol>
  </section>

  {#if entry.corrections?.length}
    <section class="body" aria-labelledby="corrections">
      <h2 id="corrections">Corrections</h2>
      <ul>
        {#each entry.corrections as fix (fix.date + fix.what)}
          <li><time datetime={fix.date}>{shortDate(fix.date)}</time>: {fix.what}</li>
        {/each}
      </ul>
    </section>
  {/if}
</article>

<nav class="neighbours" aria-label="More changes">
  {#if data.older}<a class="older" href={data.older.path}
      ><span>Before this at {entry.serviceName}</span>{data.older.title}</a
    >{/if}
  {#if data.newer}<a class="newer" href={data.newer.path}
      ><span>After this at {entry.serviceName}</span>{data.newer.title}</a
    >{/if}
</nav>

{#if data.elsewhere.length}
  <section class="more" aria-labelledby="elsewhere">
    <h2 id="elsewhere">The same thing elsewhere</h2>
    <ChangeList changes={data.elsewhere} />
  </section>
{/if}

{#if data.related.length}
  <section class="more" aria-labelledby="related">
    <h2 id="related">Related</h2>
    <ChangeList changes={data.related} />
  </section>
{/if}

<footer class="small">
  <p>
    More from <a href="/year/{yearOf(entry.date)}">{yearOf(entry.date)}</a>, every
    <a href="/category/{entry.category}">{categories[entry.category].toLowerCase()}</a>, or all of
    <a href="/{entry.service}">{entry.serviceName}</a>.
  </p>
  <p>
    Added {shortDate(entry.added)}, updated {shortDate(entry.updated)}, sources last read
    {shortDate(entry.sources_checked)}.
    <a href={correctionUrl(entry.key, entry.title)} rel="external">Something wrong?</a>
    <a href={editUrl(entry.service)} rel="external">Edit the data</a>
  </p>
</footer>

<style>
  .change {
    display: grid;
    gap: var(--space-7);
  }

  .head {
    display: grid;
    gap: var(--space-4);

    & h1 {
      max-width: 22ch;
    }
  }

  .answer {
    max-width: var(--measure);
    font-size: var(--text-md);
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-6);
    padding-top: var(--space-4);
    border-top: var(--rule-heavy) solid var(--ink);
    font-size: var(--text-sm);

    & dt {
      color: var(--text-muted);
    }
  }

  .panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 48rem;
    border: var(--rule-thin) solid var(--rule);

    & div {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-5);

      & + div {
        border-left: var(--rule-thin) solid var(--rule);
        background: var(--surface-raised);
      }
    }

    & h2 {
      font-size: var(--text-sm);
      font-weight: 600;
      letter-spacing: 0;
      color: var(--text-muted);
    }

    & p {
      font-size: var(--text-xl);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.05;
    }

    & .was {
      color: var(--text-muted);
      text-decoration: line-through var(--ink) 0.08em;
    }
  }

  .body {
    display: grid;
    gap: var(--space-3);
    max-width: var(--measure);

    & h2 {
      font-size: var(--text-md);
      margin-top: var(--space-3);
    }
  }

  blockquote {
    padding-left: var(--space-4);
    border-left: var(--rule-thin) solid var(--rule);
  }

  .sources {
    display: grid;
    gap: var(--space-4);

    & ol {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
      gap: var(--space-5) var(--space-6);
      padding: 0;
      list-style: none;
      counter-reset: source;
    }

    & li {
      display: grid;
      align-content: start;
      gap: var(--space-2);
      padding-top: var(--space-3);
      border-top: var(--rule-thin) solid var(--rule);
    }

    & blockquote {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  }

  .who {
    font-size: var(--text-sm);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    font-size: var(--text-sm);

    & span {
      color: var(--text-muted);
    }
  }

  .neighbours {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    margin-block: var(--space-7);

    & a {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-4);
      border: var(--rule-thin) solid var(--rule-faint);
      font-weight: 650;
      text-decoration: none;

      &:hover {
        border-color: var(--rule);
      }

      & span {
        font-size: var(--text-sm);
        font-weight: 400;
        color: var(--text-muted);
      }
    }

    & .newer {
      grid-column: 2;
      text-align: right;
    }
  }

  .more {
    display: grid;
    gap: var(--space-3);
    margin-bottom: var(--space-7);
  }

  .small {
    display: grid;
    gap: var(--space-2);
    padding-top: var(--space-4);
    border-top: var(--rule-thin) solid var(--rule-faint);
    font-size: var(--text-sm);
    color: var(--text-muted);

    & a + a {
      margin-left: var(--space-3);
    }
  }

  @media (max-width: 40rem) {
    .panel p {
      font-size: var(--text-lg);
    }

    .neighbours {
      grid-template-columns: 1fr;

      & .newer {
        grid-column: 1;
        text-align: left;
      }
    }
  }
</style>
