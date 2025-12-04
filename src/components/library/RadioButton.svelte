<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends HTMLInputAttributes {
        group?: any;
        value?: any;
        label?: string;
        children?: any;
    }

    let {
        group = $bindable(),
        value,
        label,
        class: className,
        children = null,
        ...rest
    }: Props = $props();
</script>

<label class="flex cursor-pointer items-center gap-2 {className}">
    <div class="w-6">
        <input
            type="radio"
            bind:group
            {value}
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
