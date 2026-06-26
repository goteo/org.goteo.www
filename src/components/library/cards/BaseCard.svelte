<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import type { HTMLStyleAttributes } from "svelte/elements";

    interface Props {
        class?: ClassNameValue;
        children: any;
        style?: HTMLStyleAttributes["style"];
    }
    let { class: classes = "", children, style }: Props = $props();
</script>

<div
    class={twMerge(
        "bg-light-surface border-light-muted min-w-sm rounded-4xl border p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]",
        classes,
    )}
    {style}
>
    {@render children()}
</div>
