<script lang="ts">
  import { page } from '$app/state';
  import { site } from '#lib/site.ts';
  import '../app.css';

  let { children } = $props();

  const nav = [
    { href: '/', label: 'The wall' },
    { href: '/prices', label: 'Price league' },
    { href: '/bill', label: 'Your bill' },
    { href: '/latest', label: 'Latest' },
    { href: '/about', label: 'About' }
  ];
</script>

<a class="skip" href="#main">Skip to content</a>

<header class="masthead">
  <a class="wordmark" href="/" aria-label="{site.name}, home">
    <img src="/favicon.svg" alt="" width="40" height="40" />
    <span><small>The</small> Enshittification <span>Index</span></span>
  </a>
  <nav aria-label="Main">
    {#each nav as { href, label } (href)}
      <a {href} aria-current={page.url.pathname === href ? 'page' : undefined}>{label}</a>
    {/each}
  </nav>
</header>

<main id="main">
  {@render children()}
</main>

<footer class="colophon">
  <p>
    Every entry is dated, sourced and archived, written flat from what the companies and the press
    actually said. Updated whenever big tech makes something worse, so: often.
  </p>
  <ul>
    <li><a href="/data">Data (CC BY 4.0)</a></li>
    <li><a href="/corrections">Corrections</a></li>
    <li><a href="/about">How it's made</a></li>
    <li><a href="/feed.xml">Atom feed</a></li>
    <li><a href={site.repo} rel="external">Source on GitHub</a></li>
  </ul>
</footer>

<style>
  .skip {
    position: absolute;
    left: var(--pad);
    top: -10rem;
    padding: var(--space-2) var(--space-3);
    background: var(--text);
    color: var(--surface);

    &:focus {
      top: var(--space-2);
    }
  }

  .masthead,
  main,
  .colophon {
    max-width: var(--page);
    margin-inline: auto;
    padding-inline: var(--pad);
  }

  .masthead {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3) var(--space-6);
    padding-block: var(--space-4);
    border-bottom: var(--rule-thin) solid var(--rule);
  }

  .wordmark {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-md);
    font-weight: 820;
    letter-spacing: -0.03em;
    line-height: 1;
    text-decoration: none;

    & img {
      transition: rotate var(--quick) var(--ease);
    }

    &:hover img {
      rotate: -8deg;
    }

    & small {
      font-size: var(--text-sm);
      font-weight: 500;
      letter-spacing: 0;
    }

    & span span {
      font-weight: 400;
    }
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-size: var(--text-sm);

    & a {
      text-decoration: none;

      &:hover,
      &[aria-current='page'] {
        text-decoration: underline;
        text-decoration-color: var(--accent);
      }
    }
  }

  main {
    padding-block: var(--space-6) var(--space-8);
  }

  @media (max-width: 40rem) {
    nav {
      column-gap: var(--space-4);
    }
  }

  .colophon {
    display: grid;
    gap: var(--space-4);
    padding-block: var(--space-6);
    border-top: var(--rule-thin) solid var(--rule);
    font-size: var(--text-sm);
    color: var(--text-muted);

    & p {
      max-width: var(--measure);
    }

    & ul {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-5);
      padding: 0;
      list-style: none;
    }
  }
</style>
