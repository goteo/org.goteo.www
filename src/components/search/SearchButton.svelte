<!--
Search Button Component
Reusable button for search actions following existing button patterns
Supports: primary (Aplicar filtros), secondary (Buscar), ghost (Cerrar filtros)
-->
<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props extends HTMLButtonAttributes {
        variant?: "primary" | "secondary" | "ghost";
        size?: "medium" | "small";
        loading?: boolean;
        fullWidth?: boolean;
    }

    let {
        variant = "secondary",
        size = "medium",
        loading = false,
        fullWidth = false,
        children,
        class: className = "",
        disabled = false,
        ...props
    }: Props = $props();

    // Base button classes - matching Figma design exactly
    const baseClasses =
        "inline-flex items-center justify-center font-body font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2";

    // Size classes - matching Figma specifications exactly
    const sizeClasses = {
        medium: "px-6 py-4 text-base leading-6 rounded-3xl",
        small: "px-4 py-2 text-sm rounded-[20px]",
    };

    // Variant classes matching Figma design exactly
    const variantClasses = {
        primary: "bg-primary text-secondary hover:bg-[#4dd4bd] focus:ring-primary",
        secondary: "bg-variant1 text-secondary hover:bg-[#d4d2f0] focus:ring-secondary",
        ghost: "bg-transparent text-secondary border border-secondary hover:bg-variant1 focus:ring-secondary",
    };

    // Width classes
    const widthClasses = $derived(fullWidth ? "w-full" : "");

    // Combine all classes
    const buttonClasses = $derived(
        [baseClasses, sizeClasses[size], variantClasses[variant], widthClasses, className]
            .filter(Boolean)
            .join(" "),
    );
</script>

<button class={buttonClasses} disabled={disabled || loading} {...props}>
    {#if loading}
        <svg
            class="mr-3 -ml-1 h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    {/if}
    {@render children?.()}
</button>
