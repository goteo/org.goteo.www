<script lang="ts">
    import { clickOutside } from "flowbite-svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { searchPlace, type NominatimResult } from "../../../services/nominatim";
    import Close from "../../icons/navigation/Close.svelte";
    import SearchIcon from "../../icons/actions/Search.svelte";

    import type { Territory } from "../../../openapi/client";

    interface Props {
        class?: ClassNameValue;
        value?: string;
        placeholder?: string;
        name?: string;
        error?: string;
        onAddressChange?: (address: string, territory: Territory) => void;
        onBlur?: () => void;
    }

    let {
        class: classes = undefined,
        value = $bindable(""),
        placeholder = "Busca una dirección...",
        name = "address",
        error = undefined,
        onAddressChange = undefined,
        onBlur = undefined,
    }: Props = $props();

    let options: NominatimResult[] = $state([]);
    let isOpen = $state(false);
    let lastSelectedAddress = $state("");

    function extractTerritory(result: NominatimResult): Territory {
        const address = result.address ?? {};
        const country = address.country_code?.toUpperCase() ?? null;

        const iso3166_2 = Object.entries(address)
            .filter(([key]) => key.startsWith("ISO3166-2-"))
            .sort()
            .map(([, v]) => v);

        return {
            country,
            subLvl1: iso3166_2[0] ?? null,
            subLvl2: iso3166_2[1] ?? null,
            address: result.display_name ?? null,
        };
    }

    function handleSelect(result: NominatimResult) {
        value = result.display_name;
        lastSelectedAddress = result.display_name;
        isOpen = false;
        options = [];

        const territory = extractTerritory(result);
        onAddressChange?.(result.display_name, territory);
    }

    function handleClear() {
        value = "";
        lastSelectedAddress = "";
        options = [];
        isOpen = false;
        onAddressChange?.("", { country: null, subLvl1: null, subLvl2: null, address: null });
    }

    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    function handleInput(e: Event) {
        const newValue = (e.target as HTMLInputElement).value;
        value = newValue;

        if (searchTimer) clearTimeout(searchTimer);

        if (!newValue || newValue.length < 2) {
            options = [];
            isOpen = false;
            return;
        }

        searchTimer = setTimeout(async () => {
            const results = await searchPlace(newValue, 6);
            options = results;
            isOpen = results.length > 0;
        }, 300);
    }

    function handleFocus() {
        if (options.length > 0) {
            isOpen = true;
        }
    }

    function handleDropdownClose() {
        isOpen = false;
    }
</script>

<div
    class={twMerge("relative w-full", classes)}
    use:clickOutside={handleDropdownClose}
>
    <div
        class="flex w-full items-center gap-2 rounded-md border p-3 {error
            ? 'border-red-500'
            : 'border-[#855a96]'}"
    >
        <SearchIcon class="shrink-0 opacity-40" width="20" height="20" />
        <input
            type="text"
            {name}
            {placeholder}
            class="w-full bg-transparent text-base text-black outline-none placeholder:opacity-48"
            {value}
            oninput={handleInput}
            onfocus={handleFocus}
            onblur={onBlur}
            autocomplete="off"
        />
        {#if value}
            <button
                type="button"
                class="shrink-0 hover:opacity-75"
                onclick={handleClear}
                aria-label="Limpiar"
            >
                <Close class="size-4" />
            </button>
        {/if}
    </div>

    {#if isOpen && options.length > 0}
        <div
            class="absolute top-full left-0 z-100 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-2xl"
        >
            <div class="flex max-h-72 w-full flex-col overflow-y-auto">
                {#each options as result}
                    <button
                        type="button"
                        class="cursor-pointer border-b border-gray-100 bg-white p-3 text-start text-sm text-black hover:bg-purple-soft last:border-b-0"
                        onclick={() => handleSelect(result)}
                    >
                        {result.display_name}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    {#if error}
        <p class="mt-1 ml-4 text-xs text-red-600" role="alert">{error}</p>
    {/if}
</div>
