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
        d="M6 7C5.44772 7 5 7.44772 5 8V24C5 24.5523 5.44772 25 6 25H26C26.5523 25 27 24.5523 27 24V20H21C18.7909 20 17 18.2091 17 16C17 13.7909 18.7909 12 21 12H27V8C27 7.44772 26.5523 7 26 7H6ZM29 8C29 6.34315 27.6569 5 26 5H6C4.34315 5 3 6.34315 3 8V24C3 25.6569 4.34315 27 6 27H26C27.6569 27 29 25.6569 29 24V8ZM27 14H21C19.8954 14 19 14.8954 19 16C19 17.1046 19.8954 18 21 18H27V14ZM21 15H23V17H21V15Z"
        fill="currentColor"
    />
</svg>
