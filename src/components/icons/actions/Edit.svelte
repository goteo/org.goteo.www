<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "32", height = "32" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <path
        d="M8 19L13 24M18 9L23 14M21 6L26 11L11 26H6L6 21L21 6Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
    />
</svg>
