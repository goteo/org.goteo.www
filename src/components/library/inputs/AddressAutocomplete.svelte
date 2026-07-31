<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import {
        searchPlace,
        extractTerritory,
        type NominatimResult,
    } from "../../../services/nominatim";
    import DropdownMenu from "../dropdown/DropdownMenu.svelte";

    import type { Territory } from "../../../openapi/client";
    import type { DropdownOption } from "../dropdown/dropdown.types";

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
        placeholder,
        name = "address",
        error = undefined,
        onAddressChange = undefined,
        onBlur = undefined,
    }: Props = $props();

    let results: NominatimResult[] = $state([]);
    let selected: DropdownOption[] = $state([]);

    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    const options = $derived(
        results.map((result) => ({
            id: result.osm_id.toString(),
            label: result.display_name,
            selected: selected.some((s) => s.id === result.osm_id.toString()),
        })),
    );

    function handleSearch(searchText: string) {
        if (searchTimer) clearTimeout(searchTimer);

        if (!searchText || searchText.length < 2) {
            results = [];
            return;
        }

        searchTimer = setTimeout(async () => {
            results = await searchPlace(searchText, 6);
        }, 300);
    }

    function handleSelect(option: DropdownOption) {
        const result = results.find((r) => r.osm_id.toString() === option.id);
        if (!result) return;

        value = result.display_name;
        const territory = extractTerritory(result);
        onAddressChange?.(result.display_name, territory);
    }

    function handleClear() {
        value = "";
        results = [];
        selected = [];
        onAddressChange?.("", {
            country: null,
            subLvl1: null,
            subLvl2: null,
            address: null,
        });
    }
</script>

<div class={twMerge("relative w-full", classes)}>
    <DropdownMenu
        variant="basic"
        hasSearch
        singleSelect
        clearable
        bind:searchValue={value}
        inputName={name}
        searchPlaceholder={placeholder}
        {options}
        bind:selected
        onSearch={handleSearch}
        onChange={handleSelect}
        onClear={handleClear}
        onInputBlur={() => onBlur?.()}
    />
    {#if error}
        <p class="mt-1 ml-4 text-xs text-red-600" role="alert">{error}</p>
    {/if}
</div>
