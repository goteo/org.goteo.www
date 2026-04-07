<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "8", height = "14" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <path d="M4 0L8 6H0L4 0Z" fill="currentColor" />
    <path d="M4 14L5.24537e-07 8L8 8L4 14Z" fill="currentColor" />
</svg>
