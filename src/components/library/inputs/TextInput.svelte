<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        value = $bindable<string | number>(""),
        id = undefined,
        name = undefined,
        placeholder = undefined,
        type = "text",
        required = false,
        disabled = false,
        class: classes = "",
        labelText = undefined,
        helperText = undefined,
        error = undefined,
        onInput = undefined,
        onBlur = undefined,
        onFocus = undefined,
    }: {
        value?: string | number | undefined;
        id?: string;
        name?: string;
        placeholder?: string;
        type?: "text" | "email" | "password" | "tel" | "url" | "date" | "number";
        required?: boolean;
        disabled?: boolean;
        class?: ClassNameValue;
        labelText?: string;
        helperText?: string;
        error?: string;
        onInput?: (event: Event) => void;
        onBlur?: (event?: FocusEvent) => void;
        onFocus?: (event?: FocusEvent) => void;
    } = $props();

    const generatedId = $props.id();
    const finalId = $derived(id ?? generatedId);

    const inputClasses = $derived(
        twMerge(
            "border-secondary w-full rounded-lg border bg-white p-4 text-base text-content placeholder:text-gray-400 transition-all outline-none focus:ring-0",
            error && "border-tertiary text-tertiary placeholder:text-tertiary/60",
            disabled && "cursor-not-allowed",
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
    <input
        bind:value
        id={finalId}
        onblur={onBlur}
        onfocus={onFocus}
        oninput={onInput}
        {name}
        {type}
        {required}
        {disabled}
        {placeholder}
        class={inputClasses}
    />
    {#if helperText && !error}
        <span id={`helper-${finalId}`} class="ml-4 text-xs text-gray-500">
            {helperText}
        </span>
    {/if}
</div>
