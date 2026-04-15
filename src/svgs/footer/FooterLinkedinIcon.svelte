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
    <g clip-path="url(#clip-footer-linkedin)">
        <rect width="24" height="24" rx="4.8" class="fill-variant1"></rect>
        <path
            d="M8.8 18.4H6.4V10.4H8.8V18.4ZM7.6 9.4C6.8 9.4 6.2 8.8 6.2 8C6.2 7.2 6.8 6.6 7.6 6.6C8.4 6.6 9 7.2 9 8C9 8.8 8.4 9.4 7.6 9.4ZM18.4 18.4H16V14.5C16 13.6 16 12.5 14.8 12.5C13.6 12.5 13.4 13.4 13.4 14.4V18.4H11V10.4H13.3V11.4H13.3C13.6 10.8 14.4 10.2 15.5 10.2C17.9 10.2 18.4 11.7 18.4 13.7V18.4Z"
            class="fill-secondary"
        ></path>
    </g>
    <defs>
        <clipPath id="clip-footer-linkedin">
            <rect width="24" height="24" rx="4.8" class="fill-white"></rect>
        </clipPath>
    </defs>
</svg>
