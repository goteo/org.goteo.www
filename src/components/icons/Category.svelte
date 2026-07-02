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
        d="M15.1296 18.9986L16.8303 26.8041C16.9483 27.3457 16.5651 27.8725 15.9742 27.9806C15.9039 27.9935 15.8323 28 15.7606 28H13.6216C13.1016 28 12.6539 27.6635 12.5519 27.1961L10.5455 18M12.7273 10H8.36364C5.95367 10 4 11.7909 4 14C4 16.2091 5.95367 18 8.36364 18H12.7273M12.7273 10V18M12.7273 10C19.2727 8.66667 24 6.66667 26.9091 4C27.5116 4 28 4.44772 28 5V23C28 23.5128 27.5789 23.9355 27.0363 23.9933L26.9091 24C24 21.3333 19.2727 19.3333 12.7273 18"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
