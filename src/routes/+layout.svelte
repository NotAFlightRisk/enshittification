<script lang="ts">
  import { page } from '$app/state';
  import Glyphs from '#lib/components/Glyphs.svelte';
  import { site } from '#lib/site.ts';
  import '../app.css';

  let { children } = $props();

  const nav = [
    { href: '/the-wall', label: 'The wall' },
    { href: '/prices', label: 'Price league' },
    { href: '/bill', label: 'Your bill' },
    { href: '/latest', label: 'Latest' },
    { href: '/about', label: 'About' }
  ];
</script>

<a class="skip" href="#main">Skip to content</a>
<Glyphs />

<header class="masthead">
  <a class="wordmark" href="/" aria-label="{site.name}, home">
    <img src="/icon.svg" alt="" width="44" height="44" />
    <span>The Enshittification Index</span>
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
  <p>Every entry dated, sourced and archived. Updated whenever big tech makes something worse.</p>
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
    background: var(--caution);
    color: var(--edge);

    &:focus {
      top: var(--space-3);
    }
  }

  .masthead,
  main,
  .colophon {
    width: min(100% - 2 * var(--pad), var(--page) - 2 * var(--pad));
    margin-inline: auto;
  }

  .masthead {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3) var(--space-6);
    padding-block: var(--space-4);
    border-bottom: var(--medium) solid var(--ink);
  }

  .wordmark {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-family: var(--font-sign);
    font-size: var(--text-lg);
    font-weight: 700;
    line-height: 1;
    text-decoration: none;

    & img {
      transition: rotate var(--quick) var(--ease);
    }

    &:hover img {
      rotate: -8deg;
    }
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-weight: 600;

    & a {
      padding-block: var(--space-1);
      text-decoration: none;
      border-bottom: 3px solid transparent;

      &:hover {
        border-color: var(--line);
      }

      &[aria-current='page'] {
        border-color: var(--ink);
      }
    }
  }

  main {
    padding-block: var(--space-6) var(--space-8);
  }

  .colophon {
    display: grid;
    gap: var(--space-4);
    padding-block: var(--space-6);
    border-top: var(--medium) solid var(--ink);
    font-size: var(--text-sm);
    color: var(--ink-soft);

    & ul {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-5);
      padding: 0;
      list-style: none;
    }
  }

  @media (max-width: 40rem) {
    .wordmark {
      font-size: var(--text-md);

      & img {
        width: 2.25rem;
        height: 2.25rem;
      }
    }

    nav {
      column-gap: var(--space-4);
      font-size: var(--text-sm);
    }
  }
</style>
