<script lang="ts">
    import type { Snippet } from "svelte";
    import type { MouseEventHandler } from "svelte/elements";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const sizeStyles = {
        md: "px-8 py-4 rounded-[24px]",
        sm: "px-4 py-2 rounded-[16px]",
    };

    const kindStyles = {
        primary: "bg-primary",
        secondary: "bg-variant1",
        ghost: "inset-ring-1 inset-ring-secondary",
        invert: "",
    };

    let {
        children,
        form = undefined,
        type = "button",
        disabled = false,
        class: classes = "",
        size = "md",
        kind = "primary",
        onclick,
        "aria-label": ariaLabel = undefined,
        "aria-busy": ariaBusy = undefined,
        "aria-pressed": ariaPressed = undefined,
        "aria-expanded": ariaExpanded = undefined,
    }: {
        children: Snippet;
        form?: string;
        type?: "button" | "submit";
        disabled?: boolean;
        size?: keyof typeof sizeStyles;
        kind?: keyof typeof kindStyles;
        class?: ClassNameValue;
        onclick?: MouseEventHandler<HTMLButtonElement>;
        "aria-label"?: string;
        "aria-busy"?: boolean;
        "aria-pressed"?: boolean;
        "aria-expanded"?: boolean;
    } = $props();
</script>

<button
    {type}
    {form}
    {disabled}
    {onclick}
    class={twMerge(
        "text-secondary disabled:bg-grey flex w-auto items-center justify-center gap-2 font-[700] transition hover:cursor-pointer",
        sizeStyles[size],
        kindStyles[kind],
        classes,
    )}
    aria-label={ariaLabel}
    aria-busy={ariaBusy}
    aria-pressed={ariaPressed}
    aria-expanded={ariaExpanded}
>
    {@render children()}
</button>
