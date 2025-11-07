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
        success: "bg-variant2",
        warning: "bg-variant4",
        error: "bg-tertiary",
    };
</script>

<div
    class={twMerge(
        "flex content-center items-center gap-2 rounded-[4px] px-2 py-1 whitespace-nowrap text-black",
        variantStyles[variant],
        classes,
    )}
>
    {@render children()}
</div>
