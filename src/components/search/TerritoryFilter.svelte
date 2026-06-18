<script lang="ts">
    import { searchPlace } from "../../services/nominatim";
    import type { DropdownItemType } from "../library/Dropdown/dropdown.types";
    import DropdownMenu from "../library/Dropdown/DropdownMenu.svelte";

    let items: DropdownItemType[] = $state([]);

    async function handleSearch(value: string) {
        if (!value) {
            items = [];
            return;
        }

        const search = await searchPlace(value, 3);

        items = search.map((result) => ({
            id: result.osm_id.toString(),
            label: result.display_name,
        }));
    }

    function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
        let timeout: ReturnType<typeof setTimeout>;

        function debounced(...args: Parameters<T>) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        }

        return debounced;
    }

    function throttle<T extends (...args: any[]) => void>(fn: T, limit: number) {
        let lastCall = 0;

        function throttled(...args: Parameters<T>) {
            const now = Date.now();

            if (now - lastCall >= limit) {
                lastCall = now;
                fn(...args);
            }
        }

        return throttled;
    }

    const searchHandler = debounce(throttle(handleSearch, 1000), 300);
</script>

<DropdownMenu
    class="border"
    variant="multiselect"
    hasSearch={true}
    onSearch={searchHandler}
    {items}
/>
