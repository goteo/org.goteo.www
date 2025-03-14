<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { config } from "$lib/i18n";

    interface LocaleInfo {
        code: string;
        label: string;
    }

    $: currentLocale = page.data.locale || config.defaultLocale;

    export let locales: LocaleInfo[] = [];
    export let loading = false;

    export let onLocaleChange = async (newLocale: string) => {
        if (window.location) {
            const newPath = getLocalePath(newLocale);
            window.location.href = newPath;
        }
    };

    function getLocalePath(newLocale: string): string {
        const currentPath = page.url.pathname;
        const segments = currentPath.split("/").filter(Boolean);
        const currentLocaleSegment = locales.map((l) => l.code).includes(segments[0])
            ? segments[0]
            : null;
        const pathWithoutLocale = currentLocaleSegment
            ? `/${segments.slice(1).join("/")}`
            : currentPath;

        return `/${newLocale}${pathWithoutLocale}`;
    }

    async function switchLocale(newLocale: string) {
        await onLocaleChange(newLocale);
    }
</script>

<div class="relative max-w-40" role="group" aria-label="Language selector">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4">
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 2C0 0.89543 0.895431 0 2 0H14C15.1046 0 16 0.89543 16 2V11.3333C16 12.4379 15.1046 13.3333 14 13.3333H4.23385L1.08313 15.8539C0.883017 16.014 0.608851 16.0452 0.377874 15.9342C0.146897 15.8232 0 15.5896 0 15.3333V2ZM2 1.33333C1.63181 1.33333 1.33333 1.63181 1.33333 2V13.9462L3.58354 12.1461C3.70175 12.0515 3.84862 12 4 12H14C14.3682 12 14.6667 11.7015 14.6667 11.3333V2C14.6667 1.63181 14.3682 1.33333 14 1.33333H2ZM4 5.33333C4 4.96514 4.29848 4.66667 4.66667 4.66667H11.3333C11.7015 4.66667 12 4.96514 12 5.33333C12 5.70152 11.7015 6 11.3333 6H4.66667C4.29848 6 4 5.70152 4 5.33333ZM4 8C4 7.63181 4.29848 7.33333 4.66667 7.33333H7.33333C7.70152 7.33333 8 7.63181 8 8C8 8.36819 7.70152 8.66667 7.33333 8.66667H4.66667C4.29848 8.66667 4 8.36819 4 8Z"
                fill="#462949"
            />
        </svg>
    </div>
    <select
        class="focus:ring-primary-500 focus:border-primary-500 w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-10 py-2 pr-8 text-sm focus:outline-none focus:ring-2"
        value={currentLocale}
        on:change={(e) => switchLocale(e.currentTarget.value)}
        aria-label="Select language"
        disabled={loading}
        transition:fade
    >
        {#if loading}
            <option>Loading...</option>
        {:else}
            {#each locales as locale}
                <option value={locale.code}>
                    {locale.label}
                </option>
            {/each}
        {/if}
    </select>
</div>
