<script lang="ts">
  import { marks, nowAt } from '#lib/strip.ts';
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

  const placed = $derived(marks(changes, from, to, today));
  const now = $derived(nowAt(from, to, today));
</script>

<ol class="strip" class:big aria-label={`${name}, ${changes.length} changes on a year line`}>
  {#if now < 100}
    <li class="now" style:--at="{now}%" aria-hidden="true"></li>
  {/if}
  {#each placed as mark (mark.key)}
    <li
      class="mark"
      class:hollow={mark.hollow}
      class:ahead={mark.ahead}
      class:late={mark.at > 55}
      style:--at="{mark.at}%"
      style:--ink={mark.ink}
    >
      <a href={mark.path}><span class="label">{mark.label}</span></a>
    </li>
  {/each}
</ol>

<style>
  .strip {
    --height: 1.75rem;
    position: relative;
    height: var(--height);
    padding: 0;
    list-style: none;

    &.big {
      --height: 4.5rem;
    }
  }

  .mark,
  .now {
    position: absolute;
    inset-block: 0;
    left: var(--at);
  }

  .now {
    border-left: var(--rule-thin) dashed var(--text-muted);
  }

  .mark a {
    position: absolute;
    inset-block: 0;
    left: calc(var(--mark-width) * -1.5);
    width: calc(var(--mark-width) * 4);
    display: flex;
    justify-content: center;

    &::before {
      content: '';
      width: var(--mark-width);
      background: var(--ink);
      transition: transform var(--quick) var(--ease);
    }

    &:hover::before,
    &:focus-visible::before {
      transform: scaleX(2);
    }

    &:focus-visible {
      outline: none;
    }
  }

  .hollow a::before {
    width: calc(var(--mark-width) * 2);
    background: none;
    box-shadow: inset 0 0 0 1.5px var(--ink);
  }

  .ahead a::before {
    background: repeating-linear-gradient(var(--ink) 0 3px, transparent 3px 6px);
  }

  .label {
    display: none;
    position: absolute;
    z-index: 2;
    bottom: calc(100% + var(--space-2));
    left: 0;
    width: max-content;
    max-width: min(22rem, 70vw);
    padding: var(--space-2) var(--space-3);
    background: var(--text);
    color: var(--surface);
    font-size: var(--text-sm);
    line-height: 1.35;
    box-shadow: 0 6px 18px rgb(0 0 0 / 0.18);
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

  @media (pointer: coarse) {
    .mark a {
      pointer-events: none;
    }
  }
</style>
