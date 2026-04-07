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
    <circle
        cx="22"
        cy="26"
        r="2"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <circle
        cx="12"
        cy="26"
        r="2"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 9H26.6126C27.1649 9 27.6126 9.44772 27.6126 10C27.6126 10.1075 27.5952 10.2143 27.5613 10.3162L24.2279 20.3162C24.0918 20.7246 23.7097 21 23.2792 21H10.8471C10.3583 21 9.9411 20.6466 9.86073 20.1644L8 9Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        d="M4 4H7L8 9"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
