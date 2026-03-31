<script lang="ts">
    import { slide } from "svelte/transition";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import ChevronDown from "../../svgs/ChevronDown.svelte";

    import type { Snippet } from "svelte";

    interface Props {
        class?: ClassNameValue;
        label: string;
        open?: boolean;
        children?: Snippet;
    }

    let { class: classes = "", label, open = $bindable(false), children }: Props = $props();

    function handleToggle() {
        open = !open;
    }
</script>

<div
    class={twMerge(
        "overflow-hidden rounded-2xl border transition-all duration-300",
        open ? "border-grey bg-soft-purple shadow-md" : "border-grey bg-white shadow-sm",
        classes,
    )}
>
    <button
        type="button"
        class={twMerge(
            "flex w-full items-center justify-between px-6 text-left transition-all duration-300 focus:outline-none",
            open ? "pt-4 pb-0" : "py-4",
        )}
        onclick={handleToggle}
        aria-expanded={open}
    >
        <span class="text-body text-[15px] font-bold lg:text-[16px]">{label}</span>
        <span class="text-secondary ml-4 shrink-0">
            <ChevronDown rotate={open} />
        </span>
    </button>
    {#if open}
        <div transition:slide|local={{ duration: 300 }}>
            <div class="text-content px-6 pt-6 pb-6 text-[13px] leading-relaxed lg:text-[14px]">
                {@render children?.()}
            </div>
        </div>
    {/if}
</div>
