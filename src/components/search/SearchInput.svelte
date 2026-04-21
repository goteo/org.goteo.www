<!--
Search Input Component
Implements main search bar with floating label matching Figma design exactly
-->
<script lang="ts">
    import { t } from "../../i18n/store";

    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends HTMLInputAttributes {
        value?: string;
        label?: string;
        onSearch?: (query: string) => void;
        onEnter?: () => void;
        onClear?: () => void;
        onBlur?: () => void;
    }

    let {
        value = "",
        label,
        onSearch,
        onEnter,
        onClear,
        onBlur,
        placeholder = "",
        class: className = "",
        "data-testid": dataTestId,
        ...props
    }: Props = $props();

    let searchQuery = $state("");

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
    class="border-secondary relative flex h-14 w-full items-center justify-between rounded-3xl border bg-white p-4 transition-colors focus-within:border-[#855a96] {className}"
>
    <!-- Input field -->
    <input
        type="search"
        bind:value={searchQuery}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onblur={onBlur}
        class="text-content placeholder:text-content flex-1 border-none bg-transparent text-base outline-none focus:ring-0 focus:outline-none focus-visible:outline-none ..."
        placeholder={placeholder || $t("search.placeholder")}
        aria-label={$t("search.label")}
        data-testid={dataTestId}
        {...props}
    />

    <!-- Close icon -->
    {#if searchQuery}
        <button
            onclick={clearSearch}
            class="text-secondary hover:bg-neutral-light ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
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
    {#if label !== ""}
        <div class="pointer-events-none absolute -top-[4.5px] left-3 bg-white px-1">
            <div class="font-['Karla'] text-xs leading-4 font-medium text-black">
                {label || $t("search.label")}
            </div>
        </div>
    {/if}
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
