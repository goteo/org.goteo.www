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
    <g clip-path="url(#clip-footer-facebook)">
        <rect width="24" height="24" rx="4.8" class="fill-variant1"></rect>
        <path
            d="M13.5 18.4V12.8H15.5L15.8 10.4H13.5V8.9C13.5 8.2 13.7 7.7 14.7 7.7H15.9V5.6C15.7 5.6 14.9 5.5 14 5.5C12.1 5.5 10.8 6.6 10.8 8.6V10.4H8.8V12.8H10.8V18.4H13.5Z"
            class="fill-secondary"
        ></path>
    </g>
    <defs>
        <clipPath id="clip-footer-facebook">
            <rect width="24" height="24" rx="4.8" class="fill-white"></rect>
        </clipPath>
    </defs>
</svg>
