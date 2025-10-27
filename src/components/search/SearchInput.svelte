<!--
Search Input Component
Implements main search bar with floating label matching Figma design exactly
-->
<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { t } from "../../i18n/store";

    interface Props extends HTMLInputAttributes {
        value?: string;
        onSearch?: (query: string) => void;
        onEnter?: () => void;
        onClear?: () => void;
    }

    let {
        value = "",
        onSearch,
        onEnter,
        onClear,
        placeholder = "",
        class: className = "",
        "data-testid": dataTestId,
        ...props
    }: Props = $props();

    let searchQuery = $state(value);

    // Keep local state in sync with prop changes (important for SSR hydration)
    $effect(() => {
        searchQuery = value;
    });

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
        // Update filter state but don't trigger search
        onSearch?.(searchQuery);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            onEnter?.() || onSearch?.(searchQuery);
        }
    }

    function clearSearch() {
        searchQuery = "";
        onSearch?.("");
        onClear?.();
    }
</script>

<!-- Search input with floating label -->
<div
    class="relative flex h-14 w-full items-center justify-between rounded-[24px] border border-[#462949] bg-[#fbfbfb] p-4 transition-colors focus-within:border-[#855a96] {className}"
>
    <!-- Input field -->
    <input
        type="search"
        bind:value={searchQuery}
        oninput={handleInput}
        onkeydown={handleKeydown}
        class="flex-1 border-none bg-transparent text-base text-[#575757] outline-none placeholder:text-[#575757] focus:ring-0 focus:outline-none focus-visible:outline-none"
        placeholder={placeholder || $t("search.placeholder")}
        aria-label={$t("search.label")}
        data-testid={dataTestId}
        {...props}
    />

    <!-- Close icon -->
    {#if searchQuery}
        <button
            onclick={clearSearch}
            class="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#462949] transition-colors hover:bg-[#e6e6e6]"
            aria-label={$t("search.clearSearch")}
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>
    {/if}

    <!-- Floating label -->
    <div class="pointer-events-none absolute -top-[4.5px] left-3 bg-[#fbfbfb] px-1">
        <div class="font-['Karla'] text-xs leading-4 font-medium text-[#3d3d3d]">
            {$t("search.label")}
        </div>
    </div>
</div>

<style>
    /* Remove default search input styling in WebKit browsers */
    input[type="search"]::-webkit-search-cancel-button,
    input[type="search"]::-webkit-search-decoration {
        -webkit-appearance: none;
        appearance: none;
    }

    /* Remove blue outline but keep accessibility */
    input[type="search"]:focus,
    input[type="search"]:focus-visible {
        outline: none;
        box-shadow: none;
        border: none;
    }
</style>
