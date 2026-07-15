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
    <path d="M16 15.0346V24.9654" stroke="currentColor" stroke-linecap="round" />
    <path
        d="M24.5 15L19.5 20L24.5 25"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
