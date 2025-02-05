<script lang="ts">
  import { _ } from "svelte-i18n";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  
  $: loading = !data.locales || data.locales.length === 0;
</script>

<div class="p-4">
  <LocaleSwitcher 
    locales={data.locales} 
    loading={loading} 
  />
  <h1 class="text-3xl font-bold underline mt-4">{$_("greeting")}</h1>
  <p class="mt-2">{$_("farewell")}</p>
  <p class="mt-2">Current locale: {data.locale}</p>
</div>

<style>
  @reference "tailwindcss/theme";
  :global(html) {
    background-color: theme(--color-gray-100);
  }
</style>
