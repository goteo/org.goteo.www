<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "40", height = "40" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("", classes)}
>
    <path d="M24 15.0346V24.9654" stroke="currentColor" stroke-linecap="round" />
    <path
        d="M15.5 25L20.5 20L15.5 15"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
