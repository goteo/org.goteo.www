<script lang="ts">
    import type { Snippet } from "svelte";
    import type { MouseEventHandler } from "svelte/elements";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const baseStyle = [
        "w-auto",
        "font-[700]",
        "text-secondary",
        "transition",
        "flex justify-center items-center gap-2",
        "hover:cursor-pointer",
        "disabled:bg-light-muted",
    ];

    const sizeStyles = {
        md: "px-8 py-4 rounded-[24px]",
        sm: "px-4 py-2 rounded-[16px]",
    };

    const kindStyles = {
        primary: "bg-primary",
        secondary: "bg-purple-tint",
        ghost: "inset-ring-1 inset-ring-[#462949]",
        invert: ""
    };

    let {
        children,
        type = "button",
        disabled = false,
        class: className = "",
        size = "md",
        kind = "primary",
        onclick,
    }: {
        children: Snippet;
        type?: "button" | "submit";
        disabled?: boolean;
        size?: keyof typeof sizeStyles;
        kind?: keyof typeof kindStyles;
        class?: ClassNameValue;
        onclick?: MouseEventHandler<HTMLButtonElement>;
    } = $props();
</script>

<button
    {type}
    {disabled}
    {onclick}
    class={twMerge(baseStyle.join(" "), sizeStyles[size], kindStyles[kind], className)}
>
    {@render children()}
</button>
