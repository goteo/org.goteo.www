<script lang="ts">
    // This component (Checkbox) is implemented in a parallel Pull Request, so it may not be available in the current branch
    // import Checkbox from "./Checkbox.svelte";
    import SearchIcon from "../../../svgs/SearchIcon.svelte";
    import type {
        DropdownItemModel,
        DropdownItemPosition,
        DropdownVariant,
    } from "./dropdown.types";

    let {
        position = "middle",
        variant,
        selectedIds = $bindable<string[]>([]),
        ...item
    } = $props<
        DropdownItemModel & {
            position?: DropdownItemPosition;
            variant: DropdownVariant;
            selectedIds?: string[];
        }
    >();

    let positionClass =
        position === "start" ? "rounded-t-lg" : position === "end" ? "rounded-b-lg" : "";
</script>

{#if item.type === "search"}
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
{:else if variant === "multiselect"}
    <div
        class="border-grey hover:bg-soft-purple hover:border-variant1 cursor-pointer border bg-white p-4 text-start {positionClass}"
    >
        <label class="flex cursor-pointer justify-between">
            <span class="text-base text-black">{item.label}</span>
            <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onchange={(e) => {
                    if (e.currentTarget.checked) {
                        selectedIds = [...selectedIds, item.id];
                    } else {
                        selectedIds = selectedIds.filter((id: string) => id !== item.id);
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
        <button class="w-full cursor-pointer text-base text-black">{item.label}</button>
    </div>
{/if}
