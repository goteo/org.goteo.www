<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends HTMLInputAttributes {
        group?: any;
        value?: any;
        label?: string;
    }

    let { group = $bindable(), value, label, class: className, ...rest }: Props = $props();
</script>

<label class="flex cursor-pointer items-center gap-2 {className}">
    <div class="w-6">
        <input
            type="radio"
            bind:group
            {value}
            class="border-secondary relative h-6 w-6 appearance-none rounded-full border after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:bg-purple-900 after:content-[''] checked:after:block"
            {...rest}
        />
    </div>
    <span class="text-gray-700">
        {#if label}
            {label}
        {:else}
            <slot />
        {/if}
    </span>
</label>

<style>
    input[type="radio"]:checked {
        background-color: var(--color-primary) !important;
        border-color: var(--color-primary) !important;
        color: var(--color-primary) !important;
    }

    input[type="radio"]:focus {
        outline: none !important;
        box-shadow: none !important;
    }
</style>
