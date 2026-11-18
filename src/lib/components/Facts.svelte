<script lang="ts">
  import Pictogram from '#lib/components/Pictogram.svelte';
  import { money, perBilling, percent } from '#lib/format.ts';
  import {
    categories,
    levelOf,
    severities,
    severityKeys,
    type Entry,
    type PlanHistory
  } from '#lib/data/types.ts';

  interface Plan extends Pick<PlanHistory, 'key' | 'name' | 'region' | 'currency' | 'billing'> {
    launch: { price: number };
    now: { price: number };
  }

  let {
    name,
    owner,
    from,
    changes,
    plans,
    history
  }: {
    name: string;
    owner: string;
    from: number;
    changes: Entry[];
    plans: Plan[];
    history?: string;
  } = $props();

  const levels = $derived(Map.groupBy(changes, ({ severity }) => severity));
  const kinds = $derived(
    [...Map.groupBy(changes, ({ category }) => category)].sort((a, b) => b[1].length - a[1].length)
  );
</script>

<aside class="facts on-sign" aria-labelledby="facts">
  <h2 id="facts">Enshittification Facts</h2>
  <p>{name}, owned by {owner}</p>

  <dl class="total">
    <div>
      <dt>Changes logged</dt>
      <dd>{changes.length}</dd>
    </div>
  </dl>
  <p class="since">Since {from}</p>

  <dl>
    {#each severityKeys.toReversed() as severity (severity)}
      <div>
        <dt>
          <span class="swatch" data-level={levelOf(severity)}></span>
          {severities[severity].name}
        </dt>
        <dd>{levels.get(severity)?.length ?? 0}</dd>
      </div>
    {/each}
  </dl>

  <dl class="kinds">
    {#each kinds as [category, list] (category)}
      <div>
        <dt><Pictogram kind={category} />{categories[category]}</dt>
        <dd>{list.length}</dd>
      </div>
    {/each}
  </dl>

  {#if plans.length}
    <table>
      <caption class="visually-hidden">What each plan cost at launch and now</caption>
      <thead>
        <tr>
          <th scope="col">Plan</th>
          <th scope="col">Launch</th>
          <th scope="col">Now</th>
          <th scope="col">Rise</th>
        </tr>
      </thead>
      <tbody>
        {#each plans as plan (plan.key)}
          <tr>
            <th scope="row">{plan.name} <span>{plan.region}, {perBilling[plan.billing]}</span></th>
            <td>{money(plan.launch.price, plan.currency)}</td>
            <td>{money(plan.now.price, plan.currency)}</td>
            <td>{percent(plan.now.price / plan.launch.price - 1)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if history}<p class="note"><a href={history}>Every price since launch</a></p>{/if}
  {/if}
</aside>

<style>
  .facts {
    display: grid;
    align-content: start;
    padding: var(--space-3) var(--space-4) var(--space-4);
    border: var(--medium) solid var(--edge);
    font-size: var(--text-sm);
  }

  h2 {
    font-family: var(--font-body);
    font-size: var(--text-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .total {
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: var(--band) solid var(--edge);
    font-size: var(--text-md);
    font-weight: 700;
  }

  .since {
    text-align: right;
    border-bottom: var(--thick) solid var(--edge);
  }

  dl {
    display: grid;

    & div {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      padding-block: var(--space-1);
      border-bottom: var(--thin) solid var(--edge);
    }

    & dt {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 600;
    }

    & dd {
      font-weight: 700;
    }
  }

  .kinds {
    --sign-size: 1.15rem;
    border-top: var(--thick) solid var(--edge);
  }

  table {
    margin-top: var(--space-3);
    border-top: var(--band) solid var(--edge);

    & th,
    & td {
      padding: var(--space-1) var(--space-2) var(--space-1) 0;
      border-color: var(--edge);
    }

    & thead th {
      font-family: var(--font-body);
      font-size: var(--text-xs);
      border-bottom-width: var(--thin);
    }

    & td:last-child {
      padding-right: 0;
      font-weight: 700;
      text-align: right;
    }
  }

  tbody th span {
    display: block;
  }

  .note {
    margin-top: var(--space-3);
  }
</style>
