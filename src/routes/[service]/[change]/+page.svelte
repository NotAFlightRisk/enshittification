<script lang="ts">
  import ChangeList from '#lib/components/ChangeList.svelte';
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Pictogram from '#lib/components/Pictogram.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import Tag from '#lib/components/Tag.svelte';
  import { formatDate, shortDate, yearOf } from '#lib/dates.ts';
  import { categories, isHollow, levelOf, levels, statuses } from '#lib/data/types.ts';
  import { listOf } from '#lib/format.ts';
  import { absolute, correctionUrl, editUrl } from '#lib/site.ts';

  let { data } = $props();
  const { entry } = $derived(data);
  const level = $derived(isHollow(entry.status) ? undefined : levelOf(entry.severity));
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

<article class="change">
  <header class="head">
    <Crumbs {crumbs} />
    <p class="signal" data-level={level}>
      <Pictogram kind={entry.category} severity={entry.severity} status={entry.status} />
      <b>{levels[levelOf(entry.severity)].name}</b>
      <span>{levels[levelOf(entry.severity)].means}</span>
    </p>
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
        <dd>
          {#if !data.regions}
            Everywhere
          {:else if data.regions.length <= 4}
            {listOf(data.regions)}
          {:else}
            <details>
              <summary>{data.regions.length} countries</summary>
              {listOf(data.regions)}
            </details>
          {/if}
        </dd>
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
      {#each [...entry.sources, ...(entry.reversed?.sources ?? [])] as source (source)}
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
  <p class="actions">
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

  .signal {
    --sign-size: 2.25rem;
    justify-self: start;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-3);
    padding: var(--space-2) var(--space-4) var(--space-2) var(--space-2);
    border: var(--medium) solid var(--edge);
    background: var(--level, var(--blank));
    color: var(--on-level, var(--edge));

    & b {
      font-family: var(--font-sign);
      font-size: var(--text-lg);
      line-height: 1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
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
    border-top: var(--thick) solid var(--ink);

    & dt {
      font-family: var(--font-sign);
      font-size: var(--text-md);
      font-weight: 700;
    }

    & details {
      max-width: 40ch;
    }

    & summary {
      cursor: pointer;
    }
  }

  .panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 48rem;
    border: var(--medium) solid var(--edge);
    background: var(--paper);

    & div {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-5);

      & + div {
        border-left: var(--medium) solid var(--edge);
      }
    }

    & h2 {
      font-size: var(--text-md);
      color: var(--ink-soft);
    }

    & p {
      font-family: var(--font-sign);
      font-size: var(--text-xl);
      font-weight: 700;
      line-height: 1.05;
      text-wrap: balance;
    }

    & .was {
      color: var(--ink-soft);
      text-decoration: line-through var(--danger) 0.1em;
    }
  }

  .body {
    display: grid;
    gap: var(--space-3);
    max-width: var(--measure);

    & h2 {
      font-size: var(--text-lg);
      margin-top: var(--space-3);
    }
  }

  blockquote {
    padding-left: var(--space-4);
    border-left: var(--thick) solid var(--caution);
  }

  .sources {
    display: grid;
    gap: var(--space-4);

    & ol {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
      gap: var(--space-4);
      padding: 0;
      list-style: none;
    }

    & li {
      display: grid;
      align-content: start;
      gap: var(--space-2);
      padding: var(--space-4);
      border: var(--thin) solid var(--line);
      border-top: var(--thick) solid var(--ink);
      background: var(--paper);
    }

    & blockquote {
      font-size: var(--text-sm);
    }
  }

  .who {
    font-size: var(--text-sm);
    color: var(--ink-soft);

    & b {
      color: var(--ink);
    }
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    font-weight: 600;

    & span {
      font-weight: 400;
      color: var(--ink-soft);
    }
  }

  .neighbours {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin-block: var(--space-7);

    & a {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-4);
      border: var(--medium) solid var(--ink);
      font-weight: 600;
      text-decoration: none;

      &:hover {
        background: var(--paper);
      }

      & span {
        font-size: var(--text-sm);
        font-weight: 400;
        color: var(--ink-soft);
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
    border-top: var(--thin) solid var(--line);
    font-size: var(--text-sm);
    color: var(--ink-soft);

    & .actions a + a {
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
