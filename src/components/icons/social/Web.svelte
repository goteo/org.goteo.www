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
        d="M46.6663 27.9999C46.6663 38.3092 38.309 46.6666 27.9997 46.6666C17.6904 46.6666 9.33301 38.3092 9.33301 27.9999C9.33301 17.6906 17.6904 9.33325 27.9997 9.33325C38.309 9.33325 46.6663 17.6906 46.6663 27.9999Z"
        fill="var(--color-variant1)"
    />
    <path
        d="M37.333 27.9999C37.333 38.3092 33.1543 46.6666 27.9997 46.6666C22.845 46.6666 18.6663 38.3092 18.6663 27.9999C18.6663 17.6906 22.845 9.33325 27.9997 9.33325C33.1543 9.33325 37.333 17.6906 37.333 27.9999Z"
        fill="var(--color-variant1)"
    />
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M45.1108 35.7777H10.8886H45.1108Z"
        fill="var(--color-variant1)"
    />
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M45.1108 20.2221H10.8886H45.1108Z"
        fill="var(--color-variant1)"
    />
    <path
        d="M27.9997 46.6666C38.309 46.6666 46.6663 38.3092 46.6663 27.9999C46.6663 17.6906 38.309 9.33325 27.9997 9.33325M27.9997 46.6666C17.6904 46.6666 9.33301 38.3092 9.33301 27.9999C9.33301 17.6906 17.6904 9.33325 27.9997 9.33325M27.9997 46.6666C33.1543 46.6666 37.333 38.3092 37.333 27.9999C37.333 17.6906 33.1543 9.33325 27.9997 9.33325M27.9997 46.6666C22.845 46.6666 18.6663 38.3092 18.6663 27.9999C18.6663 17.6906 22.845 9.33325 27.9997 9.33325M45.1108 35.7777H10.8886M45.1108 20.2221H10.8886"
        stroke="currentColor"
        stroke-width="3.11111"
        stroke-linejoin="round"
    />
</svg>
