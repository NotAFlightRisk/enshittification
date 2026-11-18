<script lang="ts">
  import { glyphs, stroke } from '#lib/icons.ts';
</script>

<svg class="visually-hidden" aria-hidden="true">
  {#each Object.entries(glyphs) as [kind, shapes] (kind)}
    <symbol id="glyph-{kind}" viewBox="0 0 24 24">
      {#each shapes as { d, fill } (d)}
        {#if fill}
          <path {d} fill="currentColor" fill-rule="evenodd" />
        {:else}
          <path {d} fill="none" stroke="currentColor" {...stroke} />
        {/if}
      {/each}
    </symbol>
  {/each}
</svg>
