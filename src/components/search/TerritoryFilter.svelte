<script lang="ts">
    import { searchPlace } from "../../services/nominatim";
    import DropdownMenu from "../library/dropdown/DropdownMenu.svelte";

    import type { DropdownOption } from "../library/dropdown/dropdown.types";
    import type { NominatimResult } from "../../services/nominatim";

    interface TerritoryOption extends DropdownOption {
        result: NominatimResult;
    }

    let options: TerritoryOption[] = $state([]);
    let selected: TerritoryOption[] = $state([]);

    type Territories = {
        countries: string[];
        subLvl1: string[];
        subLvl2: string[];
    };

    let { onTerritoryChange }: { onTerritoryChange: (value: Territories) => void } = $props();

    $effect(() => {
        const countries = new Set<string>();
        const subLvl1 = new Set<string>();
        const subLvl2 = new Set<string>();

        for (const item of selected) {
            const address = item.result.address ?? {};

            const country = address.country_code?.toUpperCase();

            const iso3166_2 = Object.entries(address)
                .filter(([key]) => key.startsWith("ISO3166-2-"))
                .map(([, value]) => value);

            const lvl1 = iso3166_2[0];
            const lvl2 = iso3166_2[1];

            if (country) {
                countries.add(country);
            }

            if (lvl1) {
                subLvl1.add(lvl1);
            }

            if (lvl2) {
                subLvl2.add(lvl2);
            }
        }

        onTerritoryChange({
            countries: [...countries],
            subLvl1: [...subLvl1],
            subLvl2: [...subLvl2],
        });
    });

    async function handleSearch(value: string) {
        if (!value) {
            options = [...selected];
            return;
        }

        const selectedIds = new Set(selected.map((s) => s.id));
        const search = await searchPlace(value, 3);

        options = search.map((result) => ({
            id: result.osm_id.toString(),
            label: result.display_name,
            selected: selectedIds.has(result.osm_id.toString()),
            result,
        }));
    }

    function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
        let timeout: ReturnType<typeof setTimeout>;

        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    function throttle<T extends (...args: any[]) => void>(fn: T, limit: number) {
        let lastCall = 0;

        return (...args: Parameters<T>) => {
            const now = Date.now();

            if (now - lastCall >= limit) {
                lastCall = now;
                fn(...args);
            }
        };
    }

    const searchHandler = debounce(throttle(handleSearch, 1000), 300);
</script>

<DropdownMenu
    bind:options
    bind:selected
    class="border"
    variant="multiselect"
    hasSearch
    onSearch={searchHandler}
/>
