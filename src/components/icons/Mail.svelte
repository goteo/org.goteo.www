<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
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
        d="M6 8C5.44772 8 5 8.44772 5 9V23C5 23.5523 5.44772 24 6 24H26C26.5523 24 27 23.5523 27 23V9C27 8.44772 26.5523 8 26 8H6ZM3 9C3 7.34315 4.34315 6 6 6H26C27.6569 6 29 7.34315 29 9V23C29 24.6569 27.6569 26 26 26H6C4.34315 26 3 24.6569 3 23V9ZM7.2 10.4C7.53137 9.95817 8.15817 9.86863 8.6 10.2L16 15.75L23.4 10.2C23.8418 9.86863 24.4686 9.95817 24.8 10.4C25.1314 10.8418 25.0418 11.4686 24.6 11.8L16.6 17.8C16.2444 18.0667 15.7556 18.0667 15.4 17.8L7.4 11.8C6.95817 11.4686 6.86863 10.8418 7.2 10.4Z"
        fill="currentColor"
    />
</svg>
