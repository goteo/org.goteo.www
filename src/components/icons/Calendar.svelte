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
        d="M10 2C10.5523 2 11 2.44772 11 3V7C11 7.55228 10.5523 8 10 8C9.44772 8 9 7.55228 9 7V3C9 2.44772 9.44772 2 10 2ZM22 2C22.5523 2 23 2.44772 23 3V7C23 7.55228 22.5523 8 22 8C21.4477 8 21 7.55228 21 7V3C21 2.44772 21.4477 2 22 2ZM3 7C3 5.34315 4.34315 4 6 4H7V6H6C5.44772 6 5 6.44772 5 7V10H27V7C27 6.44772 26.5523 6 26 6H25V4H26C27.6569 4 29 5.34315 29 7V27C29 28.6569 27.6569 30 26 30H6C4.34315 30 3 28.6569 3 27V7ZM27 12H5V27C5 27.5523 5.44772 28 6 28H26C26.5523 28 27 27.5523 27 27V12ZM19 6H13V4H19V6ZM11 16V18H9V16H11ZM17 18H15V16H17V18ZM23 16V18H21V16H23ZM11 22V24H9V22H11ZM17 24H15V22H17V24ZM23 22V24H21V22H23Z"
        fill="currentColor"
    />
</svg>
