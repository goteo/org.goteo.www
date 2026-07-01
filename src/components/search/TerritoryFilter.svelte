<script lang="ts">
    import { searchPlace } from "../../services/nominatim";
    import DropdownMenu from "../library/dropdown/DropdownMenu.svelte";

    import type { NominatimResult } from "../../services/nominatim";
    import type { DropdownOption } from "../library/dropdown/dropdown.types";

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

    let {
        onTerritoryChange,
        selectedTerritory,
    }: {
        onTerritoryChange: (value: Territories) => void;
        selectedTerritory?: Territories;
    } = $props();

    let hydrated = false;
    let lastIncoming = "";

    $effect(() => {
        const incoming = selectedTerritory;

        if (!incoming) return;

        const signature = [
            ...(incoming.countries || []),
            ...(incoming.subLvl1 || []),
            ...(incoming.subLvl2 || []),
        ]
            .filter(Boolean)
            .sort()
            .join("|");

        if (hydrated && signature === lastIncoming) return;

        lastIncoming = signature;
        hydrated = true;

        const all = [
            ...(incoming.countries || []),
            ...(incoming.subLvl1 || []),
            ...(incoming.subLvl2 || []),
        ];

        if (all.length === 0) {
            selected = [];
            return;
        }

        (async () => {
            const results = await Promise.all(
                all.map((code) => searchPlace(code, 1).then((r) => r?.[0])),
            );

            const mapped = results.filter(Boolean).map((result) => ({
                id: result.osm_id.toString(),
                label: result.display_name,
                selected: true,
                result,
            }));

            selected = mapped;
        })();
    });

    function handleChange() {
        const countries = new Set<string>();
        const subLvl1 = new Set<string>();
        const subLvl2 = new Set<string>();

        for (const item of selected) {
            const address = item.result.address ?? {};

            const country = address.country_code?.toUpperCase();

            const iso3166_2 = Object.entries(address)
                .filter(([key]) => key.startsWith("ISO3166-2-"))
                .sort()
                .map(([, value]) => value);

            const lvl1 = iso3166_2[0];
            const lvl2 = iso3166_2[1];

            if (lvl2) {
                subLvl2.add(lvl2);
                continue;
            }

            if (lvl1) {
                subLvl1.add(lvl1);
                continue;
            }

            if (country) {
                countries.add(country);
                continue;
            }
        }

        onTerritoryChange({
            countries: [...countries],
            subLvl1: [...subLvl1],
            subLvl2: [...subLvl2],
        });
    }

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
    onChange={handleChange}
/>
