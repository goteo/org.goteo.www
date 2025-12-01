<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        variant?: keyof typeof variantStyles | undefined;
        class?: ClassNameValue;
        children: Snippet;
    }

    let { variant, class: classes = "", children }: Props = $props();

    const variantStyles = {
        success: "bg-variant2",
        warning: "bg-variant4",
        error: "bg-tertiary",
        bold: "bg-grey border-grey text-secondary font-bold",
    };
</script>

<div
    class={twMerge(
        "flex content-center items-center gap-2 rounded-[4px] border border-black bg-white px-2 py-1 whitespace-nowrap text-black",
        variant ? variantStyles[variant] : "",
        classes,
    )}
>
    {@render children()}
</div>
