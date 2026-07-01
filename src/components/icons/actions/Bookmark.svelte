<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        check?: boolean;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", check = false, width = "24", height = "24" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    {#if !check}
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8 7.11103L8 26.6666L16 21.3333L24 26.6666V7.11103C24 6.12919 23.2041 5.33325 22.2222 5.33325L9.77778 5.33325C8.79594 5.33325 8 6.12919 8 7.11103Z"
            stroke="currentColor"
            stroke-width="1.77778"
            stroke-linejoin="round"
        />
    {:else}
        <path
            d="M14 6H9C7.89543 6 7 6.89543 7 8V27L15 21L23 27V15M25 5L21 10L19 7.6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    {/if}
</svg>
