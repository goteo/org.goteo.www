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
    <g clip-path="url(#clip-footer-x)">
        <rect width="24" height="24" rx="4.8" class="fill-variant1"></rect>
        <path
            d="M18.3 7.2L15.8 10.4L18.8 17.6H15.9L13.9 12.8L11.4 17.6H8.5L11.9 12.8L9.1 7.2H12L13.7 11.4L15.9 7.2H18.3Z"
            class="fill-secondary"
        ></path>
    </g>
    <defs>
        <clipPath id="clip-footer-x">
            <rect width="24" height="24" rx="4.8" class="fill-white"></rect>
        </clipPath>
    </defs>
</svg>
