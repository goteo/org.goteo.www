<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        variant?: keyof typeof variantStyles;
        class?: ClassNameValue;
        children: Snippet;
    }

    let { variant, class: classes = "", children }: Props = $props();

    const variantStyles = {
        success: "bg-variant2 border-0",
        warning: "bg-variant4 border-0",
        error: "bg-tertiary border-0 text-white",
        bold: "bg-grey border-grey text-secondary font-bold border-soft-purple",
    };
</script>

<div
    class={twMerge(
        "flex h-fit items-center justify-center gap-2 rounded-sm border border-black bg-white px-2 py-1 text-[14px] whitespace-nowrap text-black",
        variant ? variantStyles[variant] : "",
        classes,
    )}
>
    {@render children()}
</div>
