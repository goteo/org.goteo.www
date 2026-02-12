<script lang="ts">
    // This component (Checkbox) is implemented in a parallel Pull Request, so it may not be available in the current branch
    // import Checkbox from "./Checkbox.svelte";
    import SearchIcon from "../../svgs/SearchIcon.svelte";

    let {
        label,
        checked = $bindable(false),
        position = "middle",
        type = "default",
        isSearch = false,
    } = $props<{
        label: string;
        checked?: boolean;
        position?: "start" | "middle" | "end";
        type?: "default" | "checkbox";
        isSearch?: boolean;
    }>();

    let positionClass =
        position === "start" ? "rounded-t-lg" : position === "end" ? "rounded-b-lg" : "";
</script>

{#if isSearch}
    <div class="border-grey rounded-t-lg border bg-white p-4">
        <div
            class="border-secondary relative group flex items-center justify-between rounded-3xl border bg-white p-4"
        >
            <input
                class="border-0 w-full max-w-72 max-h-6 p-0 bg-white text-base/6 font-normal text-black ring-0 placeholder:opacity-48"
                type="text"
                placeholder="Search..."
            />
            <SearchIcon class="absolute right-4" width={"32"} height={"32"} />
        </div>
    </div>
{:else}
    <div
        class="border-grey hover:bg-soft-purple hover:border-variant1 border bg-white p-4 text-start {positionClass} {type ===
        'default'
            ? 'cursor-pointer'
            : ''}"
    >
        {#if type === "checkbox"}
            <label class="flex justify-between cursor-pointer">
                <span class="text-base text-black">{label}</span>
                <input
                    type="checkbox"
                    id={label}
                    bind:checked
                    class="text-primary border-secondary mt-1 size-5 shrink-0 rounded-sm border ring-0"
                />
            </label>
        {:else}
            <button class="w-full cursor-pointer text-base text-black">{label}</button>
        {/if}
    </div>
{/if}
