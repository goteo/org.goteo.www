<script lang="ts">
    import Category from "./Category.svelte";

    export type Option = {
        id: number | string;
        text: string;
    };

    let {
        options,
        selected = $bindable([]),
        selectedIds = $bindable([]),
        max,
        onchange,
    }: {
        options: Option[];
        selected?: Option[];
        selectedIds?: (number | string)[];
        max?: number;
        onchange?: (selected: Option[], option: Option) => void;
    } = $props();

    function isSelected(option: Option): boolean {
        return selectedIds.includes(option.id);
    }

    function handleClick(option: Option): void {
        if (isSelected(option)) {
            selectedIds = selectedIds.filter((id) => id !== option.id);
        } else {
            selectedIds = selectedIds.concat(option.id);
        }

        selected = options.filter((option) => selectedIds.includes(option.id));

        onchange?.(selected, option);
    }

    function calcTagType(option: Option) {
        if (max === selectedIds.length) {
            return isSelected(option) ? "active" : "ghost";
        }

        return isSelected(option) ? "active" : "default";
    }

    function calcTagDisabled(option: Option) {
        if (max === selectedIds.length && !isSelected(option)) {
            return true;
        }

        return false;
    }
</script>

<div class="flex flex-wrap gap-[16px]">
    {#each options as option}
        <Category
            type={calcTagType(option)}
            disabled={calcTagDisabled(option)}
            onclick={(e) => handleClick(option)}
        >
            {option.text}
        </Category>
    {/each}
</div>
