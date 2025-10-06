<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const baseStyle = [
        "peer",
        "w-full p-4",
        "bg-light-surface rounded-md border border-secondary",
        "text-base text-gray-700 placeholder-gray-400",
        "focus:ring-1 focus:ring-tertiary focus:outline-none",
    ];

    let {
        value = $bindable(""),
        id = undefined,
        name = undefined,
        placeholder = undefined,
        type = "text",
        required = false,
        disabled = false,
        class: className = "",
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
        class={twMerge(baseStyle, disabled && "cursor-not-allowed", className)}
    />
    {#if helperText}
        <span id={`helper-${finalId}`} class="ml-4 text-[12px]">
            {helperText}
        </span>
    {/if}
</div>
