<script lang="ts">
    import { onDestroy } from "svelte";
    import LanguageIcon from "../svgs/LanguageIcon.svelte";
    import ChevronDown from "../svgs/ChevronDown.svelte";
    import { getLanguageDisplayName } from "../utils/lang";

    let { lang, languages, select } = $props();

    let open = $state(false);
    let dropdownRef: HTMLElement;

    function selectLanguage(code: string) {
        lang = code;
        open = false;
        removeClickOutsideListener();

        select(lang);
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

    onDestroy(() => {
        removeClickOutsideListener();
    });
</script>

<div class="relative inline-block w-full text-left lg:max-w-max" bind:this={dropdownRef}>
    <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-100"
        onclick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={open}
    >
        <LanguageIcon />
        <span class="flex-1 text-left">{getLanguageDisplayName(lang)}</span>
        <ChevronDown rotate={open} />
    </button>

    {#if open}
        <div class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md">
            {#each languages as lang (lang)}
                <button
                    type="button"
                    class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-100"
                    onclick={() => selectLanguage(lang)}
                >
                    <LanguageIcon />
                    {getLanguageDisplayName(lang)}
                </button>
            {/each}
        </div>
    {/if}
</div>
