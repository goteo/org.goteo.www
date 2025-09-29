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
    }

    let {
        value = "",
        onSearch,
        onEnter,
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
    }
</script>

<!-- Figma design: Find input with floating label -->
<div
    class="relative flex h-14 w-full items-center justify-between rounded-[24px] border border-[#462949] bg-[#fbfbfb] p-4"
>
    <!-- Input text content -->
    <div class="flex-1 font-['Karla'] text-base text-[#575757]">
        <input
            type="search"
            bind:value={searchQuery}
            oninput={handleInput}
            onkeydown={handleKeydown}
            class="w-full border-none bg-transparent font-['Karla'] text-base text-[#575757] outline-none placeholder:text-[#575757]"
            placeholder=""
            aria-label={$t("search.label")}
            data-testid={dataTestId}
            {...props}
        />
        {#if !searchQuery}
            <div class="pointer-events-none absolute inset-0 flex items-center px-4 text-[#575757]">
                {placeholder || $t("search.placeholder")}
            </div>
        {/if}
    </div>

    <!-- Close icon -->
    {#if searchQuery}
        <button
            onclick={clearSearch}
            class="flex h-8 w-8 items-center justify-center rounded-full text-[#462949] transition-colors hover:bg-gray-100"
            aria-label="Clear search"
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
    <div class="absolute -top-[4.5px] left-3 bg-[#fbfbfb] px-1">
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
</style>
