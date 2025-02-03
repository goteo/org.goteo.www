<script lang="ts">
  import { locale, isLoading } from "svelte-i18n";
  import { browser } from "$app/environment";
  import type { LocaleConfig } from "$lib/i18n/types";

  const supportedLocales: LocaleConfig[] = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" }
  ];

  async function setLocale(code: LocaleConfig['code']) {
    try {
      await locale.set(code);
      if (browser) {
        localStorage.setItem("locale", code);
      }
    } catch (error) {
      console.error('Failed to set locale:', error);
    }
  }
</script>

<div class="locale-switcher" role="group" aria-label="Language selector">
  {#each supportedLocales as { code, label }}
    <button
      class="locale-button"
      class:active={$locale === code}
      on:click={() => setLocale(code)}
      aria-label={`Switch to ${label}`}
      disabled={$isLoading}
      aria-current={$locale === code}
    >
      {#if $isLoading && $locale === code}
        <span class="loading">...</span>
      {/if}
      {label}
    </button>
  {/each}
</div>

<style>
  .locale-switcher {
    display: flex;
    gap: 0.5rem;
  }

  .locale-button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    position: relative;
  }

  .locale-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .locale-button.active {
    background: #ddd;
  }

  .loading {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
