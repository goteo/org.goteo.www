<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const styles = {
        default: "inset-ring-1 hover:inset-ring-0 inset-ring-secondary bg-light-surface",
        active: "bg-secondary text-primary hover:text-secondary",
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
    class={twMerge(
        "hover:bg-variant1 w-auto rounded-[32px] px-[16px] py-[8px] font-[700]",
        styles[type],
        className,
    )}
    onclick={(e) => onclick?.(e)}
>
    {@render children()}
</button>
