<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        id: string;
        label?: string;
        helper?: string;
        value?: string;
        error?: boolean;
        disabled?: boolean;
        placeholder?: string;
        class?: ClassNameValue;
        rows?: number;
    }
    let {
        id,
        label = "",
        helper = "",
        value = $bindable(""),
        error = false,
        disabled = false,
        placeholder,
        class: className,
        rows = 4,
        ...rest
    }: Props = $props();
    let textareaClasses = $derived(
        twMerge(
            "border-secondary flex w-full min-h-[120px] resize-none items-start gap-2 rounded-lg border bg-white p-3 text-sm text-content transition-all outline-none focus:ring-secondary placeholder:text-gray-400",
            error &&
                "border-tertiary focus:ring-tertiary text-tertiary placeholder:text-tertiary/60 focus:ring-1",
            disabled && "border-transparent bg-grey cursor-not-allowed",
            className,
        ),
    );
    let labelClasses = $derived(
        twMerge(
            "absolute -top-2.5 left-2.5 bg-white px-1 text-xs transition-colors font-medium text-gray-400",
            error && "text-tertiary",
            value && !error && "text-content",
            disabled && "opacity-70",
        ),
    );
</script>

<div class="relative flex w-full flex-col gap-1 {disabled ? 'opacity-50' : ''}">
    {#if label}
        <label for={id} class={labelClasses}>{label}</label>
    {/if}
    <textarea {id} {disabled} {placeholder} {rows} bind:value class={textareaClasses} {...rest}
    ></textarea>

    {#if error && helper}
        <span class="text-tertiary mt-1 ml-3 text-xs transition-all">{helper}</span>
    {/if}
</div>
