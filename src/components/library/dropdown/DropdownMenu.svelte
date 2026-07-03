<script lang="ts">
    import { clickOutside } from "flowbite-svelte";
    import { twJoin, twMerge, type ClassNameValue } from "tailwind-merge";

    import DropdownItem from "./DropdownItem.svelte";
    import { t } from "../../../i18n/store";
    import SearchIcon from "../../icons/actions/Search.svelte";
    import Chevron from "../../icons/navigation/Chevron.svelte";

    import type { DropdownOption, DropdownVariant } from "./dropdown.types";

    interface Props {
        class?: ClassNameValue;
        variant: DropdownVariant;
        options: DropdownOption[];
        selected?: DropdownOption[];
        onChange?: (option: DropdownOption) => void;
        hasSearch?: boolean;
        searchPlaceholder?: string;
        onSearch?: (value: string) => void;
        chevronLabel?: string;
        /** Build the list with selected options at the top. */
        selectedFirst?: boolean;
        isOpen?: boolean;
    }

    let {
        class: classes = undefined,
        variant,
        options = $bindable([]),
        selected = $bindable([]),
        onChange,
        hasSearch = false,
        searchPlaceholder = $t("domain.search.bar.placeholder"),
        onSearch = undefined,
        chevronLabel = undefined,
        selectedFirst = false,
        isOpen = false,
    }: Props = $props();

    const hasHeader = $derived(hasSearch || !!chevronLabel);

    const renderedItems = $derived.by(() => {
        const selectedIds = new Set(selected.map((s) => s.id));

        const merged: DropdownOption[] = selectedFirst
            ? [...selected, ...options.filter((option) => !selectedIds.has(option.id))]
            : [
                  ...options,
                  ...selected.filter((item) => !options.some((option) => option.id === item.id)),
              ];

        return merged.map((item, index, arr) => ({
            ...item,
            selected: selectedIds.has(item.id),
            position: getPosition(index, arr.length),
        }));
    });

    function getPosition(index: number, length: number): "start" | "middle" | "end" {
        if (index === 0 && !hasHeader) return "start";
        if (index === length - 1) return "end";
        return "middle";
    }

    function isSelected(option: DropdownOption): boolean {
        return selected.length > 0 && selected.some((s) => s.id === option.id);
    }
</script>

<div
    class={twMerge("relative flex w-full flex-col border-none", classes)}
    use:clickOutside={() => (isOpen = false)}
>
    {#if hasSearch}
        <div
            class="group flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm outline-none focus:outline-none"
        >
            <input
                class="max-h-6 w-full border-0 bg-white p-0 text-base/6 font-normal text-black ring-0 placeholder:opacity-48"
                type="text"
                placeholder={searchPlaceholder}
                oninput={(e) => onSearch?.(e.currentTarget.value)}
                onclick={() => {
                    if (!isOpen) isOpen = true;
                }}
            />
            <SearchIcon class="absolute right-4" width="32" height="32" />
        </div>
    {:else if chevronLabel}
        <button
            type="button"
            class="group flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white p-4 text-base/6 font-normal text-black shadow-sm outline-none focus:outline-none"
            onclick={() => (isOpen = !isOpen)}
        >
            {chevronLabel}
            <Chevron
                direction="down"
                width="20"
                height="20"
                class={twJoin("transition-transform", isOpen && "rotate-180")}
            />
        </button>
    {/if}

    {#if isOpen}
        <div
            class="absolute top-full left-0 z-100 mt-2 w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        >
            <div class="flex max-h-72 w-full flex-col overflow-y-auto">
                {#each renderedItems as item}
                    <DropdownItem
                        {variant}
                        option={item}
                        onChange={(option) => {
                            if (option.selected && !isSelected(option)) {
                                selected = [...selected, option];
                            }
                            if (!option.selected && isSelected(option)) {
                                selected = selected.filter((s) => s.id !== option.id);
                            }
                            onChange?.(option);
                        }}
                        class={twJoin(
                            item.position === "start" && "rounded-t-lg",
                            item.position === "end" && "rounded-b-lg",
                        )}
                    />
                {/each}
            </div>
        </div>
    {/if}
</div>
