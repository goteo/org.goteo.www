<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    interface Props {
        variant?: keyof typeof variantStyles;
        class?: string;
        children: Snippet;
    }

    let { variant = "default", class: classes = "", children }: Props = $props();

    const variantStyles = {
        default: "bg-white border border-black text-secondary",
        transparent: "bg-white/90 border border-white/50 text-black",
    };
</script>

<div
    class={twMerge(
        "flex items-center content-center gap-2 rounded-[4px] px-2 py-1 whitespace-nowrap text-black",
        variantStyles[variant],
        classes,
    )}
>
    {@render children()}
</div>
