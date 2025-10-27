<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        value = $bindable(new Date()),
        id = undefined,
        name = undefined,
        required = false,
        disabled = false,
        min = undefined,
        max = undefined,
        class: className = "",
        labelText = undefined,
        helperText = undefined,
        error = undefined,
        onBlur = undefined,
        onInput = undefined,
    }: {
        value?: Date;
        id?: string;
        name?: string;
        required?: boolean;
        disabled?: boolean;
        min?: Date | string;
        max?: Date | string;
        class?: ClassNameValue;
        labelText?: string;
        helperText?: string;
        error?: string;
        onBlur?: () => void;
        onInput?: (date: Date) => void;
    } = $props();

    const finalId = id ? id : getIdForInput();

    /**
     * Converts a Date object to YYYY-MM-DD string format for HTML date input.
     */
    function dateToString(date: Date): string {
        if (!date || isNaN(date.getTime())) {
            return "";
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /**
     * Converts a Date or string to YYYY-MM-DD string format.
     */
    function toDateString(dateOrString: Date | string | undefined): string | undefined {
        if (!dateOrString) return undefined;
        if (typeof dateOrString === "string") return dateOrString;
        return dateToString(dateOrString);
    }

    /**
     * Handles changes to the date input value.
     * Converts the string value to a Date object and validates it.
     */
    function handleInput(event: Event) {
        const target = event.currentTarget as HTMLInputElement;
        const dateString = target.value;

        if (!dateString) {
            return;
        }

        // Convert string to Date
        const dateValue = new Date(dateString);

        // Validate that the date is valid
        if (isNaN(dateValue.getTime())) {
            console.warn("Invalid date value:", dateString);
            return;
        }

        // Update the bindable value
        value = dateValue;

        // Call optional input handler
        if (onInput) {
            onInput(dateValue);
        }
    }

    function getIdForInput(): string {
        const cyrb53hash = cyrb53(name + labelText + helperText);
        return `date-input-${cyrb53hash}`;
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

    // Convert min/max to string format for HTML input
    const minString = $derived(toDateString(min));
    const maxString = $derived(toDateString(max));

    // Convert current value to string for HTML input
    const valueString = $derived(dateToString(value));
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
        type="date"
        id={finalId}
        {name}
        {required}
        {disabled}
        value={valueString}
        min={minString}
        max={maxString}
        oninput={handleInput}
        onblur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${finalId}-error` : helperText ? `helper-${finalId}` : undefined}
        class={twMerge(
            "peer bg-light-surface border-secondary focus:ring-tertiary w-full rounded-md border p-4 text-base text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none",
            disabled && "cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className,
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
