<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "24", height = "24" }: Props = $props();
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
        d="M4.5 7H6.5M4.5 5H9.5M1.5 2.5V12.5L4 10.5H11.5C12.0523 10.5 12.5 10.0523 12.5 9.5V2.5C12.5 1.94772 12.0523 1.5 11.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
