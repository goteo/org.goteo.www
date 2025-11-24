<script lang="ts">
    import { itemCount } from "../stores/cart";
    import BagIcon from "../svgs/BagIcon.svelte";
    import { t } from "../i18n/store";

    // Browser check for SSR compatibility
    const browser = typeof window !== "undefined";

    // Use reactive store directly in Svelte 5 - safer for SSR
    let count = 0;

    // Reactive statement to update count when store changes
    $: if (browser) {
        count = $itemCount;
    }

    function handleDirect() {
        if (!browser) return;

        // const pathParts = window.location.pathname.split("/").filter(Boolean);
        // console.log(pathParts);
        // const languages = Object.keys(languagesList) as Locale[];
        // console.log(languages);
        // const currentLang: Locale = languages.includes(pathParts[0] as Locale)
        //     ? (pathParts[0] as Locale)
        //     : "es";
        // console.log(currentLang);

        window.location.href = `/checkout`;
    }
</script>

<button
    type="button"
    on:click={handleDirect}
    class="group relative inline-flex cursor-pointer items-center"
    aria-label={$t("header.btnCart")}
>
    <BagIcon />

    {#if count > 1}
        <span
            class="text-background absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold"
        >
            {count}
        </span>
    {/if}
</button>
