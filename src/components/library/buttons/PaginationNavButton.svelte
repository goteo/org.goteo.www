<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        onClick,
        disabled,
        ariaLabel,
        children,
    }: {
        onClick: () => void;
        disabled: boolean;
        ariaLabel: string;
        children: Snippet;
    } = $props();
</script>

<button
    onclick={onClick}
    {disabled}
    aria-label={ariaLabel}
    class="border-content flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 hover:disabled:bg-transparent"
>
    {@render children()}
</button>
