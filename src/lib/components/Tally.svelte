<script lang="ts">
  // a count scratched the way you'd count days on a cell wall, in fives

  let { count }: { count: number } = $props();

  const step = 5;
  const gap = 8;
  const width = $derived(Math.floor(count / 5) * (4 * step + gap) + (count % 5) * step + 2);
  // a little wobble so it reads as scratched rather than printed, the same every build
  const wobble = (index: number) => ((index * 7919) % 11) / 10 - 0.5;

  const strokes = $derived(
    Array.from({ length: count }, (_, index) => {
      const gate = Math.floor(index / 5);
      const place = index % 5;
      const left = gate * (4 * step + gap) + 1;
      return place === 4
        ? { x1: left - 2, y1: 13, x2: left + 3 * step + 2, y2: 3 + wobble(index) }
        : {
            x1: left + place * step + wobble(index),
            y1: 1,
            x2: left + place * step - wobble(index),
            y2: 15
          };
    })
  );
</script>

<svg class="tally" viewBox="0 0 {width} 16" {width} height="16" aria-hidden="true">
  {#each strokes as stroke, index (index)}
    <line {...stroke} />
  {/each}
</svg>

<style>
  .tally {
    flex: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    overflow: visible;
  }
</style>
