<script lang="ts">
    import DropdownItem from "./DropdownItem.svelte";
    import type {
        DropdownVariant,
        DropdownBasicItem,
        DropdownMultiSelectItem,
        DropdownItemModel,
    } from "./dropdown.types";

    let {
        variant,
        items,
        hasSearch = false,
        selectedIds = $bindable<string[]>([]),
    } = $props<
        | {
              variant: "basic";
              items: DropdownBasicItem[];
              hasSearch?: boolean;
          }
        | {
              variant: "multiselect";
              items: DropdownMultiSelectItem[];
              hasSearch?: boolean;
              selectedIds?: string[];
          }
    >();

    const renderedItems = $derived<DropdownItemModel[]>([
        ...(hasSearch ? [{ id: "search", type: "search" } as const] : []),
        ...items.map((item: DropdownBasicItem | DropdownMultiSelectItem) => ({
            ...item,
            type: variant,
        })),
    ]);

    function getPosition(index: number, length: number) {
        if (index === 0 && hasSearch) return "middle";
        if (index === length - 1) return "end";
        return "start";
    }
</script>

<div
    class="flex w-full max-w-[416px] flex-col self-center rounded-lg bg-transparent shadow-[0_35px_10px_0_rgba(0,0,0,0),0_22px_9px_0_rgba(0,0,0,0.01),0_13px_8px_0_rgba(0,0,0,0.05),0_6px_6px_0_rgba(0,0,0,0.09),0_1px_3px_0_rgba(0,0,0,0.1)]"
>
    {#each renderedItems as item, index}
        <DropdownItem
            {...item}
            {variant}
            bind:selectedIds
            position={getPosition(index, renderedItems.length)}
        />
    {/each}
</div>
