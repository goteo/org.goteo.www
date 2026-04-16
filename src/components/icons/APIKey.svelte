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
    class={twMerge("text-secondary", classes)}
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M24.0001 4L21.3334 17.3336H29.3335L15.9999 35.9981L18.6666 22.6658H10.6665L24.0001 4Z"
        stroke="currentColor"
        stroke-width="2.66671"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
