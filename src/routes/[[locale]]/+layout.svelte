<script lang="ts">
  import { isLoading, locale } from "svelte-i18n";
  import { page } from "$app/state";
  import Header from "$lib/components/Header";

  $: {
    const currentLocale = page.data.locale;
    if (currentLocale) {
      locale.set(currentLocale);
    }
  }
</script>

{#if $isLoading}
  <div class="grid place-items-center h-screen">Loading...</div>
{:else}
  <Header />
  <slot />
{/if}
