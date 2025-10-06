<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const baseStyle = [
        "w-auto",
        "rounded-[32px]",
        "px-[16px]",
        "py-[8px]",
        "font-[700]",
        "hover:bg-purple-tint",
        "hover:text-tertiary",
    ];

    const styles = {
        default: "inset-ring-1 hover:inset-ring-0 inset-ring-secondary bg-light-surface",
        active: "bg-secondary text-primary",
        ghost: "",
    };

    let {
        type = "default",
        disabled = false,
        class: className = "",
        onclick,
        children,
    }: {
        type?: keyof typeof styles;
        disabled?: boolean;
        class?: ClassNameValue;
        onclick?: (event: MouseEvent) => void;
        children: Snippet;
    } = $props();
</script>

<button
    {disabled}
    class={twMerge(baseStyle.join(" "), styles[type], className)}
    onclick={(e) => onclick?.(e)}
>
    {@render children()}
</button>
