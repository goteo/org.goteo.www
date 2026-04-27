<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        options,
        value = $bindable(),
        class: classes = "",
        onchange,
    }: {
        options: [{ value: string; label: string }, { value: string; label: string }];
        value: string;
        class?: ClassNameValue;
        onchange?: (value: string) => void;
    } = $props();

    function select(val: string) {
        value = val;
        onchange?.(val);
    }
</script>

<div class={twMerge("bg-grey inline-flex w-2/3 rounded-full p-1", classes)} role="group">
    {#each options as option}
        <button
            type="button"
            onclick={() => select(option.value)}
            class={twMerge(
                "text-secondary flex-1 cursor-pointer rounded-full px-8 py-3 text-base font-bold transition-all",
                value === option.value ? "bg-primary" : "bg-transparent",
            )}
        >
            {option.label}
        </button>
    {/each}
</div>
