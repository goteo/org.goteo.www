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
        d="M25.6 25.9077H20.3637M23.4182 20.3077V23.7538M23.4182 20.3077L21.2364 22.0308M23.4182 20.3077L25.6 22.0308M17.7455 27.2H8.14548C7.18149 27.2 6.40002 26.4285 6.40002 25.4769V6.52306C6.40002 5.57144 7.18149 4.79999 8.14548 4.79999H20.3637M20.3637 4.79999L25.6 9.96922M20.3637 4.79999V9.96922H25.6M25.6 9.96922V17.7231M11.6364 20.3077H15.1273M11.6364 16.8615H20.3637M11.6364 13.4154H20.3637"
        stroke="currentColor"
        stroke-width="1.74545"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
