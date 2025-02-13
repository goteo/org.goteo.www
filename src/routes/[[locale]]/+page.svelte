<script lang="ts">
  import { _ } from "svelte-i18n";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";
  import type { PageData } from "./$types";
  import { Button } from "$lib/components/ui/button";

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

<CampaignProgress
  obtained={150547}
  optimum={300000}
  donations={2128}
  minimum={100000}
  timeSeriesData={[
    { date: new Date("2024-01-01"), amount: 50000 },
    { date: new Date("2024-01-15"), amount: 50000 },
    { date: new Date("2024-02-01"), amount: 75000 },
    { date: new Date("2024-02-15"), amount: 75000 },
    { date: new Date("2024-03-01"), amount: 100000 },
    { date: new Date("2024-03-15"), amount: 100000 },
    { date: new Date("2024-04-01"), amount: 150000 },
    { date: new Date("2024-04-15"), amount: 150000 },
    { date: new Date("2024-05-01"), amount: 150000 },
    { date: new Date("2024-12-15"), amount: 150000 },
  ]}
/>

<style>
  /* @reference "tailwindcss/theme"; */
  :global(html) {
    /* background-color: theme(--color-gray-100); */
  }
</style>
