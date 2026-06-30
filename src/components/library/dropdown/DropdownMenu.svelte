<script lang="ts">
    import { clickOutside } from "flowbite-svelte";
    import { twJoin, twMerge, type ClassNameValue } from "tailwind-merge";

    import DropdownItem from "./DropdownItem.svelte";
    import { t } from "../../../i18n/store";
    import SearchIcon from "../../icons/actions/Search.svelte";

    import type { DropdownOption, DropdownVariant } from "./dropdown.types";

    interface Props {
        class?: ClassNameValue;
        variant: DropdownVariant;
        options: DropdownOption[];
        selected?: DropdownOption[];
        onChange?: (option: DropdownOption) => void;
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
        options = $bindable([]),
        selected = $bindable([]),
        onChange,
        hasSearch = false,
        searchPlaceholder = $t("domain.search.bar.placeholder"),
        onSearch = undefined,
        isOpen = true,
    }: Props = $props();

    const visibleOptions = $derived.by(() => {
        const ids = new Set(options.map((o) => o.id));

        return [...selected.filter((s) => !ids.has(s.id)), ...options].map((o, index, arr) => {
            return { ...o, position: getPosition(index, arr.length) };
        });
    });

    function getPosition(index: number, length: number): "start" | "middle" | "end" {
        if (index === 0 && !hasSearch) return "start";
        if (index === length - 1) return "end";
        return "middle";
    }

    function isSelected(option: DropdownOption): boolean {
        return selected.length > 0 && selected.some((s) => s.id === option.id);
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
                onclick={() => {
                    if (!isOpen) isOpen = true;
                }}
            />
            <SearchIcon class="absolute right-4" width="32" height="32" />
        </div>
    {/if}
    {#if isOpen}
        {#each visibleOptions as item}
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
    {/if}
</div>
