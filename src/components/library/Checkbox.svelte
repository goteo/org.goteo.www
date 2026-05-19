<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import type { Snippet } from "svelte";

    let {
        id,
        label,
        children,
        checked = $bindable(false),
        class: classes,
    } = $props<{
        id?: string;
        label?: string;
        children?: Snippet;
        checked?: boolean;
        class?: ClassNameValue;
    }>();
</script>

<div class="flex items-start justify-center gap-2">
    <input
        type="checkbox"
        {id}
        bind:checked
        class={twMerge(
            "border-secondary text-primary accent-secondary mt-0.5 size-5 shrink-0 rounded-sm border ring-0 ring-white outline-0",
            classes,
        )}
    />

    <label for={id} class="text-content text-base font-normal">
        {#if children}
            {@render children()}
        {:else if label}
            {label}
        {/if}
    </label>
</div>
