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
    <div class="grid h-screen place-items-center">Loading...</div>
{:else}
    <Header />
    <Navigation />
    <main class="m-8 mx-auto flex max-w-7xl flex-col gap-8">
        <slot />
    </main>
{/if}
