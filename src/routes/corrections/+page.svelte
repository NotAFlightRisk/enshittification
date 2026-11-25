<script lang="ts">
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { shortDate } from '#lib/dates.ts';
  import { correctionUrl, site } from '#lib/site.ts';

  let { data } = $props();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Corrections', path: '/corrections' }
  ];
</script>

<Seo
  title="Corrections: every fix to the index, and how to report one"
  description="Every correction made to an entry, with the date, and how to tell us when something is wrong."
  path="/corrections"
  {crumbs}
/>

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>Corrections</h1>
  <p>
    A wrong fact is worse than a missing one, so if something here is wrong, it gets fixed, and the
    fix gets logged on the entry and below.
  </p>
</header>

<section class="prose">
  <h2>How to report one</h2>
  <p>
    Every change page has a "Something wrong?" link to a short form on GitHub: which entry, what's
    wrong, and a source that shows it. No account here, just a GitHub one. Pull requests are welcome
    too, and go through the same checks as everything else.
  </p>
  <p><a href={correctionUrl()} rel="external">Report a correction</a></p>

  <h2>What happens next</h2>
  <p>
    It gets checked against the sources the same way a new entry would be. If it holds up, the entry
    is fixed with a line saying what changed, and the issue is closed with a link to the fix. Spam
    and off-topic issues get closed.
  </p>

  <h2>If you're one of the companies</h2>
  <p>
    Fair enough. If you think an entry gets your decision wrong, use the same form, with a link to
    wherever you said it. If you gave a reason at the time, it goes on the entry. Anything legal, or
    a dispute the sources can't settle, goes straight to the owner rather than an automated reply,
    and the issue gets labelled for them.
  </p>

  <h2>Every fix so far</h2>
  {#if data.fixes.length}
    <ul>
      {#each data.fixes as fix (fix.path + fix.date)}
        <li>
          <time datetime={fix.date}>{shortDate(fix.date)}</time>,
          <a href={fix.path}>{fix.title}</a>: {fix.what}
        </li>
      {/each}
    </ul>
  {:else}
    <p>
      None yet. Either it's all right, or nobody's checked. <a
        href="{site.repo}/issues"
        rel="external"
      >
        Prove it's the second one
      </a>.
    </p>
  {/if}
</section>
