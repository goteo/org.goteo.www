<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as Card from "$lib/components/ui/card";
  import type { FundingGoal, FundingData } from "./types";

  export let minimum: FundingGoal;
  export let optimal: FundingGoal;

  function calculatePercentages(data: FundingData) {
    const total = data.items.reduce((sum, item) => sum + item.amount, 0);
    return {
      items: data.items.map((item) => ({
        ...item,
        percentage: (item.amount / total) * 100,
      })),
      progress: (data.current / total) * 100,
    };
  }

  $: minimumPercentages = calculatePercentages(minimum.data);
  $: optimalPercentages = calculatePercentages(optimal.data);
</script>

<Card.Root class="basis-2/3 bg-white/50">
  <Card.Content class="space-y-8">
    <div class="space-y-2" style="width: {(minimum.amount / optimal.amount) * 100}%">
      <div class="text-sm">
        <span class="font-medium">{$_("budget.chart.minimum")}: </span>
        <span>{minimum.amount}€</span>
      </div>
      <div class="relative h-8">
        <div class="absolute inset-0 flex rounded-lg overflow-hidden">
          {#each minimumPercentages.items as item}
            <div class={item.color} style="width: {item.percentage}%"></div>
          {/each}
        </div>
        <div class="absolute" style="left: {Math.min(minimumPercentages.progress, 100) - 1}%">
          <div class="flex flex-col items-center">
            <div class="h-10 border-l-2 border-dotted border-white"></div>
            <div
              class="w-1.5 h-1.5 rounded-full bg-black"
              role="progressbar"
              aria-valuenow={minimumPercentages.progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={$_("budget.chart.progress")}
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <div class="text-sm">
        <span class="font-medium">{$_("budget.chart.optimal")}: </span>
        <span>{optimal.amount}€</span>
      </div>
      <div class="relative h-8">
        <div class="absolute inset-0 flex rounded-lg overflow-hidden">
          {#each optimalPercentages.items as item}
            <div class={item.color} style="width: {item.percentage}%"></div>
          {/each}
        </div>
        <div class="absolute bottom-0" style="left: {Math.min(optimalPercentages.progress, 100) - 1}%">
          <div class="flex flex-col items-center">
            <div
              class="w-1.5 h-1.5 rounded-full bg-black"
              role="progressbar"
              aria-valuenow={optimalPercentages.progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={$_("budget.chart.progress")}
            ></div>
            <div class="h-10 border-l-2 border-dotted border-white"></div>
          </div>
        </div>
      </div>
    </div>
  </Card.Content>
  <Card.Footer class="flex justify-end gap-6 text-sm">
    {#each minimum.data.items as item}
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded {item.color}"></div>
        <span>{item.label}</span>
      </div>
    {/each}
    <div class="flex items-center gap-2">
      <div class="h-1.5 w-1.5 rounded-full bg-black"></div>
      <span>{$_("budget.chart.progress")}</span>
    </div>
  </Card.Footer>
</Card.Root>
