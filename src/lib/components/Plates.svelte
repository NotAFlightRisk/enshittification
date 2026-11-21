<script lang="ts">
  let { value, big = false }: { value: number; big?: boolean } = $props();

  const digits = $derived(String(value).padStart(3, '0').split(''));
</script>

<span class="plates" class:big>
  <span class="visually-hidden">{value}</span>
  {#each digits as digit, index (index)}
    <span class="plate" aria-hidden="true">{digit}</span>
  {/each}
</span>

<style>
  .plates {
    flex: none;
    display: inline-flex;
    gap: 0.1em;
    font-family: var(--font-sign);
    font-size: var(--text-lg);
    font-weight: 700;
    line-height: 1;

    &.big {
      font-size: clamp(3.5rem, 14vw, 5.5rem);
    }
  }

  .plate {
    display: grid;
    place-items: center;
    width: 1.05em;
    height: 1.35em;
    border-radius: 0.1em;
    background: linear-gradient(var(--edge) 49%, var(--edge-soft) 0 51%, var(--edge) 0);
    color: var(--blank);
  }
</style>
