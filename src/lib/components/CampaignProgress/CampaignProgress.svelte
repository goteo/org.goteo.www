<script lang="ts">
  import { Area, Axis, Chart, Svg } from "layerchart";
  import { scaleLinear, scaleTime } from "d3-scale";
  import { curveBasis } from "d3-shape";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  export let obtained: number = 0;
  export let target: number = 0;
  export let donations: number = 0;
  export let minimum: number = 0;
  export let timeSeriesData: Array<{ date: Date; amount: number }> = [];

  $: progress = (obtained / target) * 100;
  $: isMinimumReached = obtained >= minimum;

  // Chart configuration
  const padding = { top: 10, right: 10, bottom: 20, left: 40 };

  // Format date for x-axis
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });
  };

  // Format amount for y-axis
  const formatAmount = (amount: number) => {
    return `${(amount / 1000).toFixed(0)}k€`;
  };
</script>

<div class="rounded-lg bg-white p-6 shadow-sm">
  {#if isMinimumReached}
    <div class="mb-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
      ¡Mínimo conseguido!
    </div>
  {/if}

  <div class="h-[200px] w-full">
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
        <Axis placement="left" format={formatAmount} ticks={5} gridlines />
        <Axis placement="bottom" format={formatDate} ticks={5} />
        <Area {curveBasis} fill="#59e9d3" fillOpacity={0.2} stroke="#59e9d3" strokeWidth={2} />
      </Svg>
    </Chart>
  </div>

  <div class="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
    <div class="h-full bg-[#59e9d3] transition-all duration-500" style="width: {Math.min(progress, 100)}%" />
  </div>

  <div class="mt-4 grid grid-cols-2 gap-8">
    <div>
      <div class="text-3xl font-bold">{obtained.toLocaleString("es-ES")}€</div>
      <div class="text-sm text-slate-600">Obtenido</div>
      <div class="mt-2 text-sm text-slate-600">
        {donations.toLocaleString("es-ES")} donaciones realizadas
      </div>
    </div>
    <div>
      <div class="text-3xl font-bold">{target.toLocaleString("es-ES")}€</div>
      <div class="text-sm text-slate-600">Óptimo</div>
      <div class="mt-2 text-sm text-slate-600">
        Mínimo {minimum.toLocaleString("es-ES")}€
      </div>
    </div>
  </div>

  <Button class="mt-6 w-full bg-[#59e9d3] hover:bg-[#4ad1bd] text-slate-800">Donar a esta campaña</Button>
</div>
