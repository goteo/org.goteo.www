<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
        align?: "left" | "right" | "center";
    }

    let { class: classes = "", width = "32", height = "32", align = "left" }: Props = $props();

    const paths = {
        left: "M18 24H6M26 16H6M26 8H6",
        right: "M14 24H26M6 16H26M6 8H26",
        center: "M20 24H12M26 16H6M20 8H12",
    };
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
        d={paths[align]}
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
