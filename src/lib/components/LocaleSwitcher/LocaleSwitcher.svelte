<script lang="ts">
  import { fade } from "svelte/transition";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { config } from "$lib/i18n";

  $: currentLocale = page.data.locale || config.defaultLocale;
  export let availableLocales = config.availableLocales;
  export let onLocaleChange = async (newLocale: string) => {
    if (goto) {
      const newPath = getLocalePath(newLocale);
      await goto(newPath, { invalidateAll: true });
    }
  };

  const localeLabels: Record<string, string> = {
    en: "English",
    es: "Español",
  };

  function getLocalePath(newLocale: string): string {
    const currentPath = page.url.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    const currentLocaleSegment = config.availableLocales.includes(segments[0]) ? segments[0] : null;
    const pathWithoutLocale = currentLocaleSegment 
      ? `/${segments.slice(1).join("/")}` 
      : currentPath;

    // Always add locale prefix including default locale
    return `/${newLocale}${pathWithoutLocale}`;
  }

  async function switchLocale(newLocale: string) {
    await onLocaleChange(newLocale);
  }
</script>

<div class="relative" role="group" aria-label="Language selector">
  <select
    class="appearance-none w-full py-2 px-4 pr-8 border border-gray-300 rounded-md bg-white cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    value={currentLocale}
    on:change={(e) => switchLocale(e.currentTarget.value)}
    aria-label="Select language"
    transition:fade
  >
    {#each availableLocales as locale}
      <option value={locale}>
        {localeLabels[locale] || locale.toUpperCase()}
      </option>
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
  </div>
</div>
