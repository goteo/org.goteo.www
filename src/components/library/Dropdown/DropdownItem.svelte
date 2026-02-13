<script lang="ts">
    // This component (Checkbox) is implemented in a parallel Pull Request, so it may not be available in the current branch
    // import Checkbox from "./Checkbox.svelte";
    import type {
        DropdownItemPosition,
        DropdownVariant,
    } from "./dropdown.types";

    let {
        id,
        label,
        position,
        variant,
        selectedIds = $bindable<string[]>([]),
    } = $props<{
        id: string;
        label: string;
        position?: DropdownItemPosition;
        variant: DropdownVariant;
        selectedIds?: string[];
    }>();

    let positionClass =
        position === "start" ? "rounded-t-lg" : position === "end" ? "rounded-b-lg" : "";
</script>

{#if variant === "multiselect"}
    <div
        class="border-grey hover:bg-soft-purple hover:border-variant1 cursor-pointer border bg-white p-4 text-start {positionClass}"
    >
        <label class="flex cursor-pointer justify-between">
            <span class="text-base text-black">{label}</span>
            <input
                type="checkbox"
                checked={selectedIds.includes(id)}
                onchange={(e) => {
                    if (e.currentTarget.checked) {
                        selectedIds = [...selectedIds, id];
                    } else {
                        selectedIds = selectedIds.filter((x: string) => x !== id);
                    }
                }}
                class="text-primary border-secondary mt-1 size-5 shrink-0 rounded-sm border ring-0"
            />
        </label>
    </div>
{:else if variant === "basic"}
    <div
        class="border-grey hover:bg-soft-purple hover:border-variant1 cursor-pointer border bg-white p-4 text-start {positionClass}"
    >
        <button class="w-full cursor-pointer text-base text-black">{label}</button>
    </div>
{/if}
