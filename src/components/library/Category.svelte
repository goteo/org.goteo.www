<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import type { Snippet } from "svelte";

    const styles = {
        default: "inset-ring-1 hover:inset-ring-0 inset-ring-secondary t bg-white text-secondary",
        active: "bg-secondary text-primary hover:text-secondary",
        ghost: "",
    };

    let {
        type = "default",
        disabled = false,
        class: classes = "",
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
    class={twMerge(
        "hover:bg-variant1 w-auto overflow-hidden rounded-4xl px-4 py-2 text-base font-bold text-ellipsis transition-all duration-300 ease-in-out",
        styles[type],
        classes,
    )}
    onclick={(e) => onclick?.(e)}
>
    {@render children()}
</button>
