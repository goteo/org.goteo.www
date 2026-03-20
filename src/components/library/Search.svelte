<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import SearchIcon from "../../svgs/SearchIcon.svelte";

    interface Props {
        class?: ClassNameValue;
        value?: string;
        placeholder?: string;
        name?: string;
        id?: string;
        label?: string;
        onsubmit?: (value: string) => void;
    }

    let {
        class: classes = "",
        value = $bindable(""),
        placeholder = "Buscar...",
        name = "search",
        id = "search",
        label = undefined,
        onsubmit,
    }: Props = $props();
</script>

<div
    class={twMerge(
        "border-secondary relative flex h-14 w-full items-center justify-between rounded-3xl border bg-white p-4",
        classes,
    )}
>
    {#if label !== undefined}
        <label for={id} class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-700">
            {label}
        </label>
    {/if}

    <input
        type="text"
        {name}
        {id}
        {placeholder}
        bind:value
        class="flex-1 border-none bg-white text-black outline-none focus:ring-0"
    />

    <button
        type="button"
        onclick={() => {
            if (onsubmit) onsubmit(value);
        }}
        class="text-secondary cursor-pointer"
    >
        <SearchIcon class="pointer-events-none h-6 w-6" />
    </button>
</div>
