<script lang="ts">
    import { clickOutside } from "flowbite-svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import DropdownItem from "./DropdownItem.svelte";
    import { t } from "../../../i18n/store";
    import SearchIcon from "../../../svgs/SearchIcon.svelte";

    import type { DropdownItemType, DropdownVariant } from "./dropdown.types";

    interface Props {
        class?: ClassNameValue;
        variant: DropdownVariant;
        items: DropdownItemType[];
        selectedIds?: string[];
        hasSearch?: boolean;
        searchPlaceholder?: string;
        /**
         * Only applies when `hasSearch` is true.
         * @param value Value of the search input
         */
        onSearch?: (value: string) => void;
        isOpen?: boolean;
    }

    let {
        class: classes = undefined,
        variant,
        items,
        selectedIds = $bindable<string[]>([]),
        hasSearch = false,
        searchPlaceholder = $t("domain.search.bar.placeholder"),
        onSearch = undefined,
        isOpen = true,
    }: Props = $props();

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
    class={twMerge(
        "flex w-full flex-col rounded-lg bg-transparent",
        "shadow-[0_35px_10px_0_rgba(0,0,0,0),0_22px_9px_0_rgba(0,0,0,0.01),0_13px_8px_0_rgba(0,0,0,0.05),0_6px_6px_0_rgba(0,0,0,0.09),0_1px_3px_0_rgba(0,0,0,0.1)]",
        classes,
    )}
    use:clickOutside={() => (isOpen = false)}
>
    {#if hasSearch}
        <div class="group relative flex items-center justify-between rounded-3xl bg-white p-4">
            <input
                class="max-h-6 w-full max-w-72 border-0 bg-white p-0 text-base/6 font-normal text-black ring-0 placeholder:opacity-48"
                type="text"
                placeholder={searchPlaceholder}
                oninput={(e) => onSearch?.(e.currentTarget.value)}
                onclick={() => (isOpen = !isOpen)}
            />
            <SearchIcon class="absolute right-4" width="32" height="32" />
        </div>
    {/if}
    {#if isOpen}
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
    {/if}
</div>
