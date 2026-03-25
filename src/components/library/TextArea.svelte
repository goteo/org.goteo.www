<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        placeholder?: string;
        labelText?: string;
        value?: string;
        helperText?: string;
        variant?: keyof typeof variantStyles;
    }

    let variantStyles = {
        default: "border-secondary focus:ring-secondary bg-white",
        disabled: "border-transparent bg-gray-light cursor-not-allowed",
        error: "border-tertiary focus:ring-tertiary bg-white text-tertiary focus:ring-1",
        success: "border-green-500 focus:ring-green-500 bg-white text-green-500",
    };

    let {
        variant = "default",
        class: classes,
        placeholder = undefined,
        labelText = "",
        value = $bindable(""),
        helperText = undefined,
    }: Props = $props();

    let error = $derived(variant === "error");
    let disabled = $derived(variant === "disabled");
    let showLabel = $derived(labelText.length > 0);
</script>

<div class="relative flex flex-col gap-1 {twMerge(disabled && 'opacity-40')}">
    {#if showLabel}
        <label
            for="textarea"
            class={twMerge(
                "text-Content text absolute -top-2 left-2.5 bg-white px-1 text-xs",
                error && "text-tertiary",
            )}>{labelText}</label
        >
    {/if}

    <textarea
        id="textarea"
        {placeholder}
        {disabled}
        bind:value
        class={twMerge(
            "border-secondary flex h-30 w-110 resize-none items-start gap-2 rounded-lg border bg-white p-3 text-sm text-gray-400 transition-all outline-none",
            variant ? variantStyles[variant] : "",
            disabled && "cursor-not-allowed",
            error && "border-tertiary placeholder:text-tertiary",

            classes,
        )}
    ></textarea>

    {#if helperText}
        <span class={twMerge("mt-1 ml-4 text-xs", error ? "text-tertiary" : "text-gray-400")}>
            {helperText}
        </span>
    {/if}
</div>
