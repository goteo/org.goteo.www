<!--
    Select Component

    Accessible form select dropdown with validation, labels, and helper text.

    Features:
    - Floating label (floats above when value is selected)
    - Helper text below select
    - Error state with red border and error message
    - Auto-generated IDs if not provided
    - Accessibility with aria-invalid and aria-describedby
    - Design system compliant styling

    Design System:
    - Background: bg-light-surface (#fbfbfb)
    - Border: border-secondary (#462949)
    - Focus: focus:ring-tertiary
    - Error: border-red-500 focus:ring-red-500
    - Border radius: rounded-lg (8px)
    - Padding: p-4 (16px)

    Usage:
    ```svelte
    <Select
        bind:value={selectedScope}
        name="scope"
        labelText="Geographic Scope"
        helperText="Select the reach of your campaign"
        error={scopeError}
        onBlur={validateScope}
    >
        <option value="">Select scope</option>
        <option value="local">Local</option>
        <option value="estatal">Estatal</option>
        <option value="internacional">Internacional</option>
    </Select>
    ```
-->
<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import Chevron from "../icons/Chevron.svelte";

    import type { Snippet } from "svelte";

    interface SelectProps {
        children: Snippet; // Options as slot content
        value?: string; // Bindable selected value
        id?: string; // Select ID (auto-generated if not provided)
        name?: string; // Select name attribute
        required?: boolean; // Required field
        disabled?: boolean; // Disabled state
        class?: string; // Additional Tailwind classes for select
        labelText?: string; // Floating label text
        helperText?: string; // Helper text below select
        error?: string; // Error message (overrides helperText)
        onBlur?: () => void; // Blur event handler
        onChange?: (value: string) => void; // Change event handler
    }

    let {
        children,
        value = $bindable(),
        id,
        name,
        required = false,
        disabled = false,
        class: className = "",
        labelText,
        helperText,
        error,
        onBlur,
        onChange,
    }: SelectProps = $props();

    // Generate ID if not provided
    const generatedId = $props.id();
    const selectId = id || `select-${generatedId}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    let isOpen = $state(false);

    /**
     * Handle blur event
     */
    function handleBlur() {
        isOpen = false;
        onBlur?.();
    }

    /**
     * Handle change event
     */
    function handleChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        value = target.value;
        isOpen = false;
        onChange?.(target.value);
    }
</script>

<div class="relative">
    <!-- Floating Label -->
    {#if labelText}
        <label
            for={selectId}
            class="text-secondary absolute top-[-8px] left-3 bg-white px-1 text-[12px] leading-[16px] font-medium transition-all duration-200"
        >
            {labelText}
            {#if required}
                <span class="text-tertiary">*</span>
            {/if}
        </label>
    {/if}

    <!-- Select Element -->
    <select
        {name}
        {required}
        {disabled}
        id={selectId}
        bind:value
        onclick={() => (isOpen = !isOpen)}
        onchange={handleChange}
        onblur={handleBlur}
        onkeydown={(e) => e.key === "Escape" && (isOpen = false)}
        class={twMerge(
            "w-full appearance-none rounded-lg border bg-white px-4 py-4 pr-10 text-[16px] leading-[24px] transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500 focus:ring-red-500" : "border-secondary focus:ring-0",
            className,
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        style="-webkit-appearance: none; -moz-appearance: none; appearance: none; background-image: none;"
    >
        {@render children()}
    </select>
    <div class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
        <Chevron direction={isOpen ? "up" : "down"} width="20" height="20" />
    </div>

    <!-- Helper Text -->
    {#if !error && helperText}
        <p id={helperId} class="mt-1 text-[12px] text-gray-500">
            {helperText}
        </p>
    {/if}

    <!-- Error Message -->
    {#if error}
        <p id={errorId} role="alert" class="mt-1 text-[12px] text-red-600">
            {error}
        </p>
    {/if}
</div>
