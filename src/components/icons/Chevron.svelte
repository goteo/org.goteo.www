<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        direction?: "left" | "right" | "up" | "down";
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", direction = "right", width = "24", height = "24" }: Props = $props();

    const paths = {
        left: "M21 6L11 16L21 26",
        right: "M11 26L21 16L11 6",
        up: "M26 21L16 11L6 21",
        down: "M6 11L16 21L26 11",
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
        d={paths[direction]}
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
