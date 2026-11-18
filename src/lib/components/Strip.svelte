<script lang="ts">
  import Pictogram from '#lib/components/Pictogram.svelte';
  import { fit, height, marks, nowAt } from '#lib/strip.ts';
  import type { Entry } from '#lib/data/types.ts';

  let {
    changes,
    from,
    to,
    today,
    name,
    big = false
  }: {
    changes: Entry[];
    from: number;
    to: number;
    today: string;
    name: string;
    big?: boolean;
  } = $props();

  const placed = $derived(marks(changes, from, to));
  const posts = $derived(height(placed));
  const now = $derived(nowAt(from, to, today));
</script>

<ol
  class="strip"
  class:big
  style:--posts={posts.wide}
  style:--narrow-posts={posts.narrow}
  style:--wide-fit={fit.wide}
  style:--narrow-fit={fit.narrow}
  aria-label="{name}, {changes.length} changes on a year line"
>
  {#if now < 100}
    <li class="now" style:--at="{now}%" aria-hidden="true"></li>
  {/if}
  {#each placed as mark (mark.key)}
    <li
      class="mark"
      class:late={mark.at > 55}
      data-severity={mark.severity}
      style:--at="{mark.at}%"
      style:--lane={mark.lane}
      style:--narrow-lane={mark.narrowLane}
    >
      <a href={mark.path} aria-label={mark.label}>
        <Pictogram kind={mark.category} severity={mark.severity} status={mark.status} />
        <span class="label" aria-hidden="true">{mark.label}</span>
      </a>
    </li>
  {/each}
</ol>

<style>
  .strip {
    --scale: 1;
    --step: calc(2.1rem * var(--scale));
    --rows: var(--posts);
    --fit: var(--wide-fit);
    container-type: inline-size;
    position: relative;
    height: calc(var(--rows) * var(--step) + 1rem * var(--scale));
    padding: 0;
    list-style: none;
    background: var(--tape) bottom / 100% 0.45rem no-repeat;

    &.big {
      --scale: 1.45;
    }
  }

  .mark,
  .now {
    position: absolute;
    left: var(--at);
    bottom: 0;
  }

  .now {
    top: 0;
    border-left: 2px dashed var(--danger);
  }

  .mark {
    --size: 1.35rem;
    --sign-size: min(var(--size) * var(--scale), var(--fit) * 100cqi);
    --stack: var(--lane);
    display: flex;
    flex-direction: column;
    align-items: center;
    translate: -50% 0;

    &[data-severity='1'] {
      --size: 1.05rem;
    }

    &[data-severity='3'] {
      --size: 1.75rem;
    }

    &::after {
      content: '';
      width: 2px;
      height: calc(var(--stack) * var(--step) + 0.55rem * var(--scale));
      background: var(--ink);
    }

    & a {
      position: relative;
      display: block;
      line-height: 0;
      transition: scale var(--quick) var(--ease);

      &:hover,
      &:focus-visible {
        z-index: 3;
        scale: 1.15;
      }
    }
  }

  .label {
    display: none;
    position: absolute;
    bottom: calc(100% + var(--space-2));
    left: 0;
    width: max-content;
    max-width: min(22rem, 70vw);
    padding: var(--space-2) var(--space-3);
    background: var(--ink);
    color: var(--ground);
    font-size: var(--text-sm);
    line-height: 1.35;
    pointer-events: none;
    transition:
      opacity var(--quick) var(--ease),
      translate var(--quick) var(--ease),
      display var(--quick) allow-discrete;

    .late & {
      left: auto;
      right: 0;
    }

    a:hover &,
    a:focus-visible & {
      display: block;

      @starting-style {
        opacity: 0;
        translate: 0 4px;
      }
    }
  }

  @media (max-width: 40rem) {
    .strip {
      --scale: 0.8;
      --rows: var(--narrow-posts);
      --fit: var(--narrow-fit);

      &.big {
        --scale: 1;
      }
    }

    .mark {
      --stack: var(--narrow-lane);
    }
  }

  @media (pointer: coarse) {
    .mark a {
      pointer-events: none;
    }
  }
</style>
