<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";
    import { twMerge } from "tailwind-merge";

    interface Props extends HTMLInputAttributes {
        group?: any;
        label?: string;
        class?: string;
        children?: Snippet;
    }

    let { group = $bindable(), label, class: classes, children, ...rest }: Props = $props();
</script>

<label class="flex cursor-pointer items-center gap-2">
    <div class="w-6">
        <input
            type="radio"
            bind:group
            class={twMerge(
                "checked:bg-primary checked:border-primary checked:text-primary border-secondary after:bg-secondary relative h-6 w-6 appearance-none rounded-full border bg-white after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:content-[''] checked:after:block focus:shadow-none focus:outline-0",
                classes,
            )}
            {...rest}
        />
    </div>
    {#if label}
        <span class="text-gray-700">
            {label}
        </span>
    {/if}
    {@render children?.()}
</label>
