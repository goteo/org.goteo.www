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
        "inline-flex items-center justify-center font-['Karla'] font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-[8px]";

    // Size classes - matching Figma specifications exactly
    const sizeClasses = {
        medium: "px-[24px] py-[16px] text-[16px] leading-[24px] rounded-[24px]",
        small: "px-4 py-2 text-sm rounded-[20px]",
    };

    // Variant classes matching Figma design exactly
    const variantClasses = {
        primary: "bg-[#59e9d3] text-[#462949] hover:bg-[#4dd4bd] focus:ring-[#59e9d3]",
        secondary: "bg-variant1 text-[#462949] hover:bg-[#d4d2f0] focus:ring-[#462949]",
        ghost: "bg-transparent text-[#462949] border border-[#462949] hover:bg-variant1 focus:ring-[#462949]",
    };

    // Width classes
    const widthClasses = fullWidth ? "w-full" : "";

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
