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
    class={twMerge("overflow-hidden rounded-[4.8px]", classes)}
>
    <g clip-path="url(#clip-footer-gmail)">
        <rect width="24" height="24" rx="4.8" class="fill-variant1"></rect>
        <path
            d="M4 6V18H7.5V12.5L12 15.5L16.5 12.5V18H20V6C20 5.45 19.55 5 19 5H18.5C18.22 5 17.95 5.11 17.75 5.31L12 10.25L6.25 5.31C6.05 5.11 5.78 5 5.5 5H5C4.45 5 4 5.45 4 6Z"
            class="fill-secondary"
        ></path>
    </g>
    <defs>
        <clipPath id="clip-footer-gmail">
            <rect width="24" height="24" rx="4.8" class="fill-white"></rect>
        </clipPath>
    </defs>
</svg>
