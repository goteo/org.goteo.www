<script lang="ts">
  import { _ } from "svelte-i18n";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";
  import type { PageData } from "./$types";
  import { Button } from "$lib/components/ui/button";

  import { Area, Axis, Chart, Svg } from "layerchart";
  import { scaleTime } from "d3-scale";
  import { format, PeriodType } from "@layerstack/utils";
  import CampaignProgress from "$lib/components/CampaignProgress/CampaignProgress.svelte";

  export let data: PageData;

  const dateSeriesData = [
    { date: new Date("2023-01-01"), value: 10 },
    { date: new Date("2023-01-02"), value: 20 },
    { date: new Date("2023-01-03"), value: 15 },
    { date: new Date("2023-01-04"), value: 25 },
  ];

  $: loading = !data.locales || data.locales.length === 0;
</script>

<div class="p-4">
  <LocaleSwitcher locales={data.locales} {loading} />
  <h1 class="text-3xl font-bold underline mt-4">{$_("greeting")}</h1>
  <p class="mt-2">{$_("farewell")}</p>
  <p class="mt-2">Current locale: {data.locale}</p>
  <Button>Click me</Button>
</div>

<div class="h-[300px] p-4 border rounded">
  <Chart
    data={dateSeriesData}
    x="date"
    xScale={scaleTime()}
    y="value"
    yDomain={[0, null]}
    yNice
    padding={{ left: 16, bottom: 24 }}
  >
    <Svg>
      <Axis placement="left" grid rule />
      <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, { variant: "short" })} rule />
      <Area line={{ class: "stroke-2 stroke-primary" }} class="fill-primary/30" />
    </Svg>
  </Chart>
</div>

<CampaignProgress
  obtained={150547}
  target={999999}
  donations={2128}
  minimum={20000}
  timeSeriesData={[
    { date: new Date("2024-01-01"), amount: 0 },
    { date: new Date("2024-01-15"), amount: 75000 },
    { date: new Date("2024-02-01"), amount: 150547 },
  ]}
/>

<style>
  /* @reference "tailwindcss/theme"; */
  :global(html) {
    /* background-color: theme(--color-gray-100); */
  }
</style>
