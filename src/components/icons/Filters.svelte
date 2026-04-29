<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        on?: boolean;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "20", height = "14", on = false }: Props = $props();
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M19 9C17.8954 9 17 9.89543 17 11C17 12.1046 17.8954 13 19 13C20.1046 13 21 12.1046 21 11C21 9.89543 20.1046 9 19 9ZM15.126 10C15.5701 8.27477 17.1362 7 19 7C20.8638 7 22.4299 8.27477 22.874 10H28C28.5523 10 29 10.4477 29 11C29 11.5523 28.5523 12 28 12H22.874C22.4299 13.7252 20.8638 15 19 15C17.1362 15 15.5701 13.7252 15.126 12H4C3.44772 12 3 11.5523 3 11C3 10.4477 3.44772 10 4 10H15.126ZM13 19C11.8954 19 11 19.8954 11 21C11 22.1046 11.8954 23 13 23C14.1046 23 15 22.1046 15 21C15 19.8954 14.1046 19 13 19ZM9.12602 20C9.57006 18.2748 11.1362 17 13 17C14.8638 17 16.4299 18.2748 16.874 20H28C28.5523 20 29 20.4477 29 21C29 21.5523 28.5523 22 28 22H16.874C16.4299 23.7252 14.8638 25 13 25C11.1362 25 9.57006 23.7252 9.12602 22H4C3.44772 22 3 21.5523 3 21C3 20.4477 3.44772 20 4 20H9.12602Z"
        fill="currentColor"
    />
    {#if on == true}
        <circle cx="28" cy="4" r="4" fill="var(--color-tertiary)" />
    {/if}
</svg>
