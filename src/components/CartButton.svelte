<script lang="ts">
    import Bag from "../components/icons/Bag.svelte";
    import { t } from "../i18n/store";
    import { itemCount } from "../stores/cart";

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
    <Bag items={count > 1 ? count : undefined} />
</button>
