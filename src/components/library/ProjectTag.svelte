<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    interface Props {
        variant?: "default" | "transparent";
        class?: string;
        children: Snippet;
    }

    let { variant = "default", class: className = "", children }: Props = $props();

    const baseStyle = [
        "flex",
        "items-center",
        "gap-2",
        "rounded",
        "px-2",
        "py-1",
        "text-sm",
        "font-bold",
        "whitespace-nowrap"
    ];

    const variantStyles = {
        default: "bg-light-muted border border-white text-secondary",
        transparent: "bg-white/90 border border-white/50 text-black"
    };
</script>

<div class={twMerge(baseStyle.join(" "), variantStyles[variant], className)}>
    {@render children()}
</div>