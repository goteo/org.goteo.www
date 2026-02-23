<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

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
        error = undefined,
        onBlur = undefined,
    }: {
        value?: string;
        id?: string;
        name?: string;
        placeholder?: string;
        type?: "text" | "email" | "password" | "tel" | "url" | "date";
        required?: boolean;
        disabled?: boolean;
        class?: ClassNameValue;
        labelText?: string;
        helperText?: string;
        error?: string;
        onBlur?: () => void;
    } = $props();

    const finalId = id ? id : getIdForInput();

    function getIdForInput(): string {
        const cyrb53hash = cyrb53(type + name + placeholder + labelText + helperText);

        return `input-${cyrb53hash}`;
    }

    function cyrb53(str: string, seed = 0) {
        let h1 = 0xdeadbeef ^ seed,
            h2 = 0x41c6ce57 ^ seed;

        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }

        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
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
            "peer border-secondary focus:ring-tertiary w-full rounded-md border bg-white p-4 text-base text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none",
            disabled && "cursor-not-allowed",
            classes,
        )}
    />
    {#if helperText && !error}
        <span id={`helper-${finalId}`} class="ml-4 text-[12px] text-gray-500">
            {helperText}
        </span>
    {/if}
    {#if error}
        <p id={`${finalId}-error`} class="mt-1 ml-4 text-[12px] text-red-600" role="alert">
            {error}
        </p>
    {/if}
</div>
