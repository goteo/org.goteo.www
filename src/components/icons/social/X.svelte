<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "56", height = "56" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <rect width="56" height="56" rx="11.2" fill="var(--color-variant1)" />
    <path
        d="M38.3602 11.6665H43.5883L32.1093 24.7366L45.5204 42.4665H34.9961L26.7563 31.6922L17.323 42.4665H12.095L24.2559 28.4872L11.4131 11.6665H22.1988L29.643 21.5089L38.3602 11.6665ZM36.5304 39.3979H39.4286L20.6758 14.6215H17.5617L36.5304 39.3979Z"
        fill="currentColor"
    />
</svg>
