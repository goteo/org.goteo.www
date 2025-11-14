<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        variant?: "default" | "transparent";
        class?: ClassNameValue;
        children: Snippet;
    }

    let { variant = "default", class: classes = "", children }: Props = $props();

    const variantStyles = {
        default: "bg-light-muted border border-white text-secondary",
        transparent: "bg-white/90 border border-white/50 text-black",
    };
</script>

<div
    class={twMerge(
        "flex items-center gap-2 rounded px-2 py-1 text-sm font-bold whitespace-nowrap",
        variantStyles[variant],
        classes,
    )}
>
    {@render children()}
</div>
