<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import type { Snippet } from "svelte";

    let {
        children,
        class: classes = "",
    }: {
        children: Snippet;
        class?: ClassNameValue;
    } = $props();
</script>

<div
    class={twMerge(
        "border-grey flex flex-col items-center justify-between rounded-4xl border bg-white p-6 shadow-sm",
        classes,
    )}
>
    {@render children()}
</div>
