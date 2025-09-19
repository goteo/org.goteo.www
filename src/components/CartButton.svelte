<script lang="ts">
    import { itemCount } from "../stores/cart";
    import { onMount } from "svelte";
    import BagIcon from "../svgs/BagIcon.svelte";
    import { languagesList, type Locale } from "../i18n/locales";
    import { t } from "../i18n/store";

    let count = 0;

    function handleDirect() {
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

    onMount(() => {
        const unsubscribe = itemCount.subscribe((val) => {
            count = val;
        });
        return unsubscribe;
    });
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
            class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
        >
            {count}
        </span>
    {/if}
</button>
