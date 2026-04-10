<script lang="ts">
    import { clickOutside } from "flowbite-svelte";

    import ChevronDown from "../svgs/ChevronDown.svelte";
    import LanguageIcon from "../svgs/LanguageIcon.svelte";
    import { getLanguageDisplayName } from "../utils/lang";

    let { languages, selected, onSelect } = $props();

    let open = $state(false);

    function selectLanguage(code: string) {
        open = false;
        selected = code;

        onSelect(code);
    }
    function toggleDropdown() {
        open = !open;
    }
</script>

<div
    class="relative inline-block w-full text-left lg:max-w-max"
    use:clickOutside={() => (open = false)}
>
    <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-100"
        onclick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={open}
    >
        <LanguageIcon />
        <span class="flex-1 text-left">{getLanguageDisplayName(selected)}</span>
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
