<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { twMerge } from "tailwind-merge";

    interface Props extends HTMLInputAttributes {
        group?: any;
        label?: string;
        class?: string;
        children?: any;
    }

    let {
        group = $bindable(),
        label,
        class: className,
        children = null,
        ...rest
    }: Props = $props();
</script>

<label class={twMerge("flex cursor-pointer items-center gap-2", className)}>
    <div class="w-6">
        <input
            type="radio"
            bind:group
            class="checked:bg-primary checked:border-primary checked:text-primary border-secondary after:bg-secondary relative h-6 w-6 appearance-none rounded-full border bg-white after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:content-[''] checked:after:block focus:shadow-none focus:outline-0"
            {...rest}
        />
    </div>
    <span class="text-gray-700">
        {#if label}
            {label}
        {:else}
            {@render children()}
        {/if}
    </span>
</label>
