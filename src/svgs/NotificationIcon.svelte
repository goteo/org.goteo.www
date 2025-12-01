<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        iconColor?: string;
    }

    let { class: classes = "", iconColor }: Props = $props();
</script>

<svg
    class={twMerge(classes)}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        d="M5.25 9H8.25M5.25 6H12.75M0.75 2.25V17.25L4.5 14.25H15.75C16.5784 14.25 17.25 13.5784 17.25 12.75V2.25C17.25 1.42157 16.5784 0.75 15.75 0.75H2.25C1.42157 0.75 0.75 1.42157 0.75 2.25Z"
        stroke={iconColor || "#462949"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
