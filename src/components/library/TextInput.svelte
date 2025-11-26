<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";
    import { cyrb53 } from "../../utils/cyrb53";

    let {
        value = $bindable(""),
        id = undefined,
        name = undefined,
        placeholder = undefined,
        type = "text",
        required = false,
        disabled = false,
        class: classes = "",
        labelText = undefined,
        helperText = undefined,
    }: {
        value?: string;
        id?: string;
        name?: string;
        placeholder?: string;
        type?: "text" | "email" | "password" | "tel" | "url";
        required?: boolean;
        disabled?: boolean;
        class?: ClassNameValue;
        labelText?: string;
        helperText?: string;
    } = $props();

    const finalId = id ? id : getElementId();

    function getElementId(): string {
        const attributesHash = cyrb53(type + name + placeholder + labelText + helperText);

        return `input-${attributesHash}`;
    }
</script>

<div class={twMerge("relative", disabled && "opacity-40")}>
    {#if labelText}
        <label
            for={finalId}
            class="absolute -top-2 left-4 -translate-y-1/2 transform text-[10px] font-medium text-gray-500 transition-all"
        >
            {labelText}
        </label>
    {/if}
    <input
        bind:value
        id={finalId}
        {name}
        {type}
        {required}
        {disabled}
        {placeholder}
        class={twMerge(
            "peer bg-light-surface border-secondary focus:ring-tertiary w-full rounded-md border p-4 text-base text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none",
            disabled && "cursor-not-allowed",
            classes,
        )}
    />
    {#if helperText}
        <span id={`helper-${finalId}`} class="ml-4 text-[12px]">
            {helperText}
        </span>
    {/if}
</div>
