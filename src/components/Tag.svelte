<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const baseStyle = [
        "w-auto",
        "rounded-[32px]",
        "px-[16px]",
        "py-[8px]",
        "font-[700]",
        "hover:bg-[#e6e5f7]",
        "hover:text-secondary",
    ];

    const styles = {
        default: "inset-ring-1 hover:inset-ring-0 inset-ring-[#462949] bg-[#fbfbfb]",
        active: "bg-[#462949] text-primary",
        ghost: "",
    };

    let {
        type = "default",
        class: className = "",
        onclick,
        children,
    }: {
        type?: keyof typeof styles;
        class?: ClassNameValue;
        onclick?: (event: MouseEvent) => void;
        children: Snippet;
    } = $props();
</script>

<button class={twMerge(baseStyle.join(" "), styles[type], className)} onclick={(e) => onclick?.(e)}>
    {@render children()}
</button>
