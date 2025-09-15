<script lang="ts">
    import { onDestroy } from "svelte";
    import LanguageIcon from "../svgs/LanguageIcon.svelte";
    import ChevronDown from "../svgs/ChevronDown.svelte";

    export let languages: string[];

    let currentLang = languages[0];
    let open = false;
    $: rotate = open;
    let dropdownRef: HTMLElement;

    function selectLanguage(lang: string) {
        currentLang = lang;
        open = false;
        removeClickOutsideListener();
    }

    function handleClickOutside(event: MouseEvent) {
        if (!dropdownRef?.contains(event.target as Node)) {
            open = false;
            removeClickOutsideListener();
        }
    }

    let listenerAdded = false;

    function addClickOutsideListener() {
        if (!listenerAdded) {
            document.addEventListener("click", handleClickOutside);
            listenerAdded = true;
        }
    }

    function removeClickOutsideListener() {
        if (listenerAdded) {
            document.removeEventListener("click", handleClickOutside);
            listenerAdded = false;
        }
    }

    function toggleDropdown() {
        open = !open;
        if (open) {
            addClickOutsideListener();
        } else {
            removeClickOutsideListener();
        }
    }

    function getLanguageDisplayName(lang: string): string {
        const displayNames = new Intl.DisplayNames(lang, { type: "language", });
        const displayName = displayNames.of(lang)!;

        if (["es", "ca", "eu", "gl"].includes(lang)) {
            return displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }

        return displayName;
    }

    onDestroy(() => {
        removeClickOutsideListener();
    });
</script>

<div class="relative inline-block w-full lg:max-w-max text-left" bind:this={dropdownRef}>
    <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-100"
        on:click={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={open}
    >
        <LanguageIcon />
        <span class="flex-1 text-left">{getLanguageDisplayName(currentLang)}</span>
        <ChevronDown {rotate} />
    </button>

    {#if open}
        <div class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md">
            {#each languages as lang (lang)}
                <button
                    type="button"
                    class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-100"
                    on:click={() => selectLanguage(lang)}
                >
                    <LanguageIcon />
                    {getLanguageDisplayName(lang)}
                </button>
            {/each}
        </div>
    {/if}
</div>
