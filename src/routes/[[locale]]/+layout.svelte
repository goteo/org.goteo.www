<script lang="ts">
  import { isLoading, locale } from "svelte-i18n";
  import { page } from "$app/state";
  import Header from "$lib/components/Header";
  import Navigation from "$lib/components/Navigation";

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
  <Navigation />
  <main class="max-w-7xl mx-auto flex flex-col gap-8 m-8">
    <slot />
  </main>
{/if}
