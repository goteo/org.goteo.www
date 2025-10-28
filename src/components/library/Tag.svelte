<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        class: classNames = "",
        children,
    }: {
        class?: ClassNameValue;
        children: Snippet;
    } = $props();
</script>

<div
    class={twMerge("flex items-center gap-2 rounded-sm border border-black px-2 py-1", classNames)}
>
    {@render children()}
</div>
