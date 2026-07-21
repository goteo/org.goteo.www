<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        value = $bindable(""),
        id = undefined,
        placeholder = undefined,
        labelText = undefined,
        helperText = undefined,
        error = undefined,
        disabled = false,
        class: classes = "",
        rows = 4,
        onInput = undefined,
        onBlur = undefined,
        onFocus = undefined,
    }: {
        value?: string;
        id?: string;
        placeholder?: string;
        labelText?: string;
        helperText?: string;
        error?: string;
        disabled?: boolean;
        class?: ClassNameValue;
        rows?: number;
        onInput?: (event: Event) => void;
        onBlur?: (event?: FocusEvent) => void;
        onFocus?: (event?: FocusEvent) => void;
    } = $props();

    const generatedId = $props.id();
    const finalId = $derived(id ?? generatedId);

    const textareaClasses = $derived(
        twMerge(
            "border-secondary w-full min-h-30 resize-none rounded-lg border bg-white p-4 text-base text-content placeholder:text-gray-400 transition-all outline-none focus:ring-0",
            error && "border-tertiary text-tertiary placeholder:text-tertiary/60",
            disabled && "border-transparent bg-grey cursor-not-allowed",
            classes,
        ),
    );

    const labelClasses = $derived(
        twMerge(
            "text-secondary absolute top-0 left-4 -translate-y-1/2 transform bg-white px-1 text-sm font-medium transition-all",
            error && "text-tertiary",
            disabled && "opacity-70",
        ),
    );
</script>

<div class={twMerge("relative", disabled && "opacity-50")}>
    {#if labelText}
        <label for={finalId} class={labelClasses}>
            {labelText}
        </label>
    {/if}
    <textarea
        {id}
        {disabled}
        {placeholder}
        {rows}
        onblur={onBlur}
        onfocus={onFocus}
        oninput={onInput}
        bind:value
        class={textareaClasses}></textarea>
    {#if helperText && !error}
        <span id={`helper-${finalId}`} class="ml-4 text-xs text-gray-500">
            {helperText}
        </span>
    {/if}
</div>
