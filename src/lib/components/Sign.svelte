<script lang="ts">
  import type { Snippet } from 'svelte';
  import { levels, type Level } from '#lib/data/types.ts';

  let { level, children }: { level: Level; children: Snippet } = $props();
</script>

<div class="sign" data-level={level}>
  <p class="signal">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="triangle" d="M12 2.5 23 21.5H1z" />
      <path class="mark" d="M12 9v5.5M12 17.6v.1" />
    </svg>
    {levels[level].name}
  </p>
  <div class="body on-sign">
    {@render children()}
  </div>
</div>

<style>
  .sign {
    overflow: hidden;
    border: var(--thick) solid var(--edge);
    border-radius: 0.75rem;
  }

  .signal {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-5);
    border-bottom: var(--thick) solid var(--edge);
    background: var(--level);
    color: var(--on-level);
    font-family: var(--font-sign);
    font-size: var(--text-xl);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.06em;
    text-transform: uppercase;

    & svg {
      width: 1em;
      height: 1em;
    }
  }

  .triangle {
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .mark {
    stroke: var(--level);
    stroke-width: 2.8;
    stroke-linecap: round;
  }

  .body {
    padding: var(--space-5);
  }

  @media (max-width: 40rem) {
    .signal {
      font-size: var(--text-lg);
      padding-inline: var(--space-4);
    }

    .body {
      padding: var(--space-4);
    }
  }
</style>
