<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import ArrowRightIcon from "../../../svgs/ArrowRightIcon.svelte";

    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        children?: Snippet;
        class?: ClassNameValue;
    }

    let { title, children, class: classes = "" }: Props = $props();
</script>

<div class={twMerge("border-secondary flex flex-col gap-4 border-b py-6", classes)}>
    <div class="flex items-center gap-3">
        <ArrowRightIcon />
        <span class="text-secondary flex-1 text-sm font-bold lg:text-base">{title}</span>
    </div>
    {#if children}
        <div class="text-content text-xs leading-relaxed lg:text-sm">
            {@render children()}
        </div>
    {/if}
</div>
