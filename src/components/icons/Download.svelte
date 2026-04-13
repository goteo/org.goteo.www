<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "24", height = "24" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <path
        d="M2 22H22M7 13L12 18L17 13M12 2V16"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
