<script lang="ts">
    import { twMerge } from "tailwind-merge";

    let { class: className = "", children } = $props();
</script>

<div
    class={twMerge(
        "bg-light-surface border-light-muted min-w-sm rounded-[32px] border p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]",
        className,
    )}
>
    {@render children()}
</div>
