<script lang="ts">
    import SearchIcon from "../../../svgs/SearchIcon.svelte";
    import DropdownItem from "./DropdownItem.svelte";
    import type { DropdownItemType, DropdownVariant } from "./dropdown.types";

    let {
        variant,
        items,
        hasSearch = false,
        selectedIds = $bindable<string[]>([]),
    } = $props<{
        variant: DropdownVariant;
        items: DropdownItemType[];
        hasSearch?: boolean;
        selectedIds?: string[];
    }>();

    const renderedItems = $derived(
        items.map((item: DropdownItemType, index: number, arr: DropdownItemType[]) => ({
            ...item,
            position: getPosition(index, arr.length),
        })),
    );

    function getPosition(index: number, length: number): "start" | "middle" | "end" {
        if (index === 0 && !hasSearch) return "start";
        if (index === length - 1) return "end";
        return "middle";
    }
</script>

<div
    class="flex w-full flex-col rounded-lg bg-transparent shadow-[0_35px_10px_0_rgba(0,0,0,0),0_22px_9px_0_rgba(0,0,0,0.01),0_13px_8px_0_rgba(0,0,0,0.05),0_6px_6px_0_rgba(0,0,0,0.09),0_1px_3px_0_rgba(0,0,0,0.1)]"
>
    {#if hasSearch}
        <div class="border-grey rounded-t-lg border bg-white p-4">
            <div
                class="border-secondary group relative flex items-center justify-between rounded-3xl border bg-white p-4"
            >
                <input
                    class="max-h-6 w-full max-w-72 border-0 bg-white p-0 text-base/6 font-normal text-black ring-0 placeholder:opacity-48"
                    type="text"
                    placeholder="Search..."
                />
                <SearchIcon class="absolute right-4" width={"32"} height={"32"} />
            </div>
        </div>
    {/if}
    {#each renderedItems as item}
        <DropdownItem
            {...item}
            {variant}
            bind:selectedIds
            class={item.position === "start"
                ? "rounded-t-lg"
                : item.position === "end"
                  ? "rounded-b-lg"
                  : ""}
        />
    {/each}
</div>
