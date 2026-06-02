<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import type { Snippet } from "svelte";

    type CategoryType = "default" | "active" | "ghost";

    let {
        type = "default",
        disabled = false,
        skeleton = false,
        class: classes = "",
        onclick,
        children,
    }: {
        type?: CategoryType;
        disabled?: boolean;
        skeleton?: boolean;
        class?: ClassNameValue;
        onclick?: (event: MouseEvent) => void;
        children: Snippet;
    } = $props();
</script>

<button
    disabled={disabled || skeleton}
    class={twMerge(
        "w-auto rounded-4xl px-4 py-2 font-bold transition-all",
        skeleton
            ? "bg-grey pointer-events-none animate-pulse text-transparent select-none"
            : twMerge("hover:bg-variant1", `category-${type}`),
        classes,
    )}
    onclick={(e) => onclick?.(e)}
>
    {@render children()}
</button>
