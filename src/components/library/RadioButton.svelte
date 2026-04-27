<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";

    const id = $props.id();

    interface Props extends HTMLInputAttributes {
        group?: any;
        label?: string;
        class?: string;
        children?: Snippet;
    }

    let { group = $bindable(), label, class: classes, children, ...rest }: Props = $props();
</script>

<label for={id} class="flex cursor-pointer items-center gap-2">
    <div class="w-6">
        <input
            {id}
            bind:group
            type="radio"
            class={twMerge(
                "checked:bg-primary checked:border-primary checked:text-primary border-secondary after:bg-secondary relative h-6 w-6 appearance-none rounded-full border bg-white after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:content-[''] checked:after:block focus:shadow-none focus:[box-shadow:none] focus:outline-none",
                classes,
            )}
            {...rest}
        />
    </div>
    {#if label}
        <span class="text-content">
            {label}
        </span>
    {/if}
    {@render children?.()}
</label>
