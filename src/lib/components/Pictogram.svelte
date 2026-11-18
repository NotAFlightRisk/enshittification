<script lang="ts">
  import { isHollow, levelOf, type Category, type Severity, type Status } from '#lib/data/types.ts';

  let { kind, severity, status }: { kind: Category; severity?: Severity; status?: Status } =
    $props();

  const level = $derived(severity && !(status && isHollow(status)) ? levelOf(severity) : undefined);
</script>

<svg
  class="sign"
  class:ahead={status === 'scheduled'}
  data-level={level}
  viewBox="-2 -2 28 28"
  aria-hidden="true"
>
  <rect x="-1" y="-1" width="26" height="26" rx="3.5" />
  <use href="#glyph-{kind}" width="24" height="24" />
</svg>

<style>
  .sign {
    flex: none;
    width: var(--sign-size, 1.5em);
    height: var(--sign-size, 1.5em);
    color: var(--on-level);

    &:not([data-level]) {
      --level: var(--blank);
      --on-level: var(--edge);
    }
  }

  rect {
    fill: var(--level);
    stroke: var(--edge);
    stroke-width: 2;
  }

  .ahead rect {
    stroke-dasharray: 4 3;
  }
</style>
