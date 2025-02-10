<script lang="ts">
  import { Area, Chart, Svg, Rule } from "layerchart";
  import { scaleLinear, scaleTime } from "d3-scale";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Card, CardContent } from "$lib/components/ui/card";

  export let obtained: number = 0;
  export let target: number = 0;
  export let donations: number = 0;
  export let minimum: number = 0;
  export let timeSeriesData: Array<{ date: Date; amount: number }> = [];

  $: progress = (obtained / target) * 100;
  $: isMinimumReached = obtained >= minimum;

  // Chart configuration
  const padding = { top: 2, right: 0, bottom: 0, left: 0 };
</script>

<Card class="w-full max-w-md drop-shadow-lg">
  <CardContent class="p-6 space-y-6">
    <div class="space-y-6 border rounded-3xl">
      {#if isMinimumReached}
        <div class="flex justify-end mr-4 mt-4">
          <Badge variant="outline">Mínimo conseguido!</Badge>
        </div>
      {/if}

      <div class="h-[150px] w-full overflow-hidden rounded-b-3xl">
        <Chart
          data={timeSeriesData}
          x="date"
          xScale={scaleTime()}
          y="amount"
          yScale={scaleLinear()}
          yDomain={[0, Math.max(obtained, target)]}
          {padding}
        >
          <Svg>
            <Area fill="#59E9D3" />
            <Rule y={target} class="stroke-1 stroke-gray-400 [stroke-dasharray:2] [stroke-linecap:round] " />
            <Rule y={minimum} class="stroke-1 stroke-gray-400 [stroke-dasharray:2] [stroke-linecap:round] " />
          </Svg>
        </Chart>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-4">
        <div>
          <p class="text-base font-medium text-gray-500">Obtenido</p>
          <p class="text-3xl font-bold">{obtained.toLocaleString()}€</p>
        </div>
        <div>
          <p class="text-base font-medium text-gray-500">Donaciones realizadas</p>
          <p class="text-xl font-semibold">{donations}</p>
        </div>
      </div>
      <div class="space-y-4">
        <div>
          <p class="text-base font-medium text-gray-500">Óptimo</p>
          <p class="text-3xl font-bold">{target.toLocaleString()}€</p>
        </div>
        <div>
          <p class="text-base font-medium text-gray-500">Mínimo</p>
          <p class="text-xl font-semibold">{minimum.toLocaleString()}€</p>
        </div>
      </div>
    </div>

    <Button size="lg" class="w-full">Donar a esta campaña</Button>
  </CardContent>
</Card>
