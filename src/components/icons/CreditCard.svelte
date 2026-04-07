<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M6 7C5.44772 7 5 7.44772 5 8V11H27V8C27 7.44772 26.5523 7 26 7H6ZM29 8C29 6.34315 27.6569 5 26 5H6C4.34315 5 3 6.34315 3 8V24C3 25.6569 4.34315 27 6 27H26C27.6569 27 29 25.6569 29 24V8ZM27 15V24C27 24.5523 26.5523 25 26 25H6C5.44772 25 5 24.5523 5 24V15H27ZM7 22C7 21.4477 7.44772 21 8 21H16C16.5523 21 17 21.4477 17 22C17 22.5523 16.5523 23 16 23H8C7.44772 23 7 22.5523 7 22Z"
        fill="currentColor"
    />
</svg>
