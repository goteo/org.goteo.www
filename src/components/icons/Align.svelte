<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        width?: string | number;

        align?: string;
        height?: string | number;
    }

    let { class: classes = "", width = "32", height = "32", align = "left" }: Props = $props();
</script>

{#if align == "left"}
    <!-- Left -->
    <svg
        {width}
        {height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-secondary", classes)}
    >
        <path
            d="M18 24H6M26 16H6M26 8H6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if align == "right"}
    <!-- Right -->
    <svg
        {width}
        {height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-secondary", classes)}
    >
        <path
            d="M14 24H26M6 16H26M6 8H26"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if align == "center"}
    <!-- Center -->
    <svg
        {width}
        {height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-secondary", classes)}
    >
        <path
            d="M20 24H12M26 16H6M20 8H12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{/if}
