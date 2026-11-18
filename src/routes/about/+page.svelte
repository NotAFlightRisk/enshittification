<script lang="ts">
  import Crumbs from '#lib/components/Crumbs.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { categories } from '#lib/data/types.ts';
  import { site, suggestionUrl } from '#lib/site.ts';

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' }
  ];
</script>

<Seo
  title="How the index is made and sourced"
  description="What counts as a change, where the sources come from, how every claim gets checked against an archived copy, and how to tell us we got it wrong."
  path="/about"
  {crumbs}
/>

<header class="page-head">
  <Crumbs {crumbs} />
  <h1>About the index</h1>
  <p>
    A dated, sourced list of the decisions that made big tech services worse for the people using
    them. Not a ranking, not a rant, just the receipts.
  </p>
</header>

<section class="prose">
  <p>
    "Enshittification" is Cory Doctorow's word for the way platforms go off: good to their users
    first, then good to their business customers at the users' expense, then good only to
    themselves. Everyone's watched it happen. This is the paper trail, one change at a time, so the
    next time someone asks when YouTube started blocking ad blockers, the answer comes with a date
    and a link.
  </p>

  <h2>What goes in</h2>
  <p>
    A decision by the company that made the service worse for its users: one of
    {Object.values(categories).join(', ').toLowerCase()}. Climbdowns and ended tests stay in, drawn
    hollow, because they still happened. Changes for the better don't, unless they undo one of ours.
  </p>

  <h2>How an entry is made</h2>
  <ul>
    <li>Every entry is written from the source itself, never from memory or a search summary.</li>
    <li>
      The company's own post, help page or filing comes first. Decent press fills in when there
      isn't one. A forum post, a "best of" list or another tracker is never the source of a fact.
    </li>
    <li>
      Each source carries a quote copied from the page and a copy saved in the
      <a href="https://web.archive.org" rel="external">Wayback Machine</a>, so it can't quietly
      change underneath us.
    </li>
    <li>
      Every number in an entry has to turn up in one of its sources, and every price rise has to
      start from the price before it. Both are checked by a script on every change and again every
      week.
    </li>
    <li>
      Titles say what happened in plain words. The opinions live on this page, not in the entries.
    </li>
  </ul>

  <h2>What it isn't</h2>
  <p>
    It isn't a score. With a handful of entries per service, any total would rank how much has been
    written about each company rather than how much worse it got. The marks on the wall are what's
    been logged, not how bad anything was. The <a href="/prices">price league</a> is the one ranking,
    because prices are numbers nobody here made up.
  </p>

  <h2>Who's behind it</h2>
  <p>
    It's an open project on <a href={site.repo} rel="external">GitHub</a>, kept up by a small team
    and anyone who fancies helping. No ads, no affiliate links, no tracking beyond a cookie-free
    visitor count. It'd be a bit rich otherwise.
  </p>

  <h2>Something missing or wrong?</h2>
  <p>
    <a href={suggestionUrl} rel="external">Suggest a change to add</a>, or see
    <a href="/corrections">how corrections work</a>.
  </p>
</section>
