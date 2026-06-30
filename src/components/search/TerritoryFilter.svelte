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

    $effect(() => {
        console.log("Selected territories:", selected);
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
