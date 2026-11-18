<script lang="ts">
  import { money } from '#lib/format.ts';
  import { shortDate } from '#lib/dates.ts';
  import type { priceChart } from '#lib/chart.ts';

  let {
    chart,
    currency,
    service,
    label
  }: {
    chart: ReturnType<typeof priceChart>;
    currency: string;
    service: string;
    label: string;
  } = $props();

  // every other year on a phone, so the labels don't pile up
  const thin = $derived(chart.years.length > 7);
</script>

<figure class="chart">
  <div class="plot" role="group" aria-label={label}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {#each chart.years as { year, x } (year)}
        <line class="grid" x1={x} x2={x} y1="0" y2="100" />
      {/each}
      <polyline class="inflation" points={chart.inflation} />
      <path class="price" d={chart.line} />
    </svg>
    {#each chart.points as point, index (point.date)}
      {@const content = `${money(point.price, currency)}`}
      <span
        class="point"
        class:start={point.x < 8}
        class:end={point.x > 80}
        style:left="{point.x}%"
        style:top="{point.y}%"
      >
        {#if point.change}
          <a href="/{service}/{point.change}" title="{shortDate(point.date)}: what changed"
            >{content}</a
          >
        {:else}
          <span title="Launch, {shortDate(point.date)}">{content}</span>
        {/if}
        {#if index === 0}<span class="visually-hidden">at launch</span>{/if}
      </span>
    {/each}
  </div>
  <ol class="years" aria-hidden="true">
    {#each chart.years as { year, x }, index (year)}
      <li class:minor={thin && index % 2 === 1} style:left="{x}%">{year}</li>
    {/each}
  </ol>
  <figcaption>
    <span class="key price">Price</span>
    <span class="key inflation">The launch price kept up with inflation</span>
  </figcaption>
</figure>

<style>
  .chart {
    display: grid;
    gap: var(--space-2);
  }

  .plot {
    position: relative;
    height: 13rem;
    margin-top: var(--space-5);
    border-bottom: var(--rule-thin) solid var(--rule);
  }

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;

    & * {
      vector-effect: non-scaling-stroke;
      fill: none;
    }
  }

  .grid {
    stroke: var(--rule-faint);
  }

  .price {
    stroke: var(--price-rise);
    stroke-width: 2.5;
  }

  .inflation {
    stroke: var(--text-muted);
    stroke-width: 1.5;
    stroke-dasharray: 2 4;
  }

  .point {
    position: absolute;
    translate: -50% calc(-100% - var(--space-1));
    font-size: var(--text-sm);
    font-weight: 700;
    white-space: nowrap;

    &.start {
      translate: 0 calc(-100% - var(--space-1));
    }

    &.end {
      translate: -100% calc(-100% - var(--space-1));
    }

    & a {
      text-decoration-color: var(--price-rise);
    }
  }

  .years {
    position: relative;
    height: 1.25rem;
    padding: 0;
    list-style: none;
    font-size: var(--text-xs);
    color: var(--text-muted);

    & li {
      position: absolute;
      translate: -50% 0;
    }
  }

  figcaption {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .key {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    &::before {
      content: '';
      width: 1.5rem;
      border-top: 2.5px solid var(--price-rise);
    }

    &.inflation::before {
      border-top: 1.5px dashed var(--text-muted);
    }
  }

  @media (max-width: 40rem) {
    .minor {
      visibility: hidden;
    }
  }
</style>
