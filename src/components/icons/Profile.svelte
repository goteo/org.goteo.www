<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        width?: string | number;

        login?: boolean;
        height?: string | number;
    }

    let { class: classes = "", width = "32", height = "32", login = false }: Props = $props();
</script>

{#if login == false}
    <svg
        {width}
        {height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-Secondary", classes)}
    >
        <path
            d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31ZM16 31C11.499 31.0002 7.5 28.8 5.09535 26.3C5.09535 23.8 9.75 19.75 16 19.75C22.25 19.75 26.4096 24.3 26.4096 26.8C24 29.3 20.501 30.9998 16 31ZM21 12.25C21 15.0114 18.7614 17.25 16 17.25C13.2386 17.25 11 15.0114 11 12.25C11 9.48858 13.2386 7.25 16 7.25C18.7614 7.25 21 9.48858 21 12.25Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        ></path>
    </svg>
{:else}
    <svg
        {width}
        {height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-primary", classes)}
    >
        <circle cx="20" cy="20" r="14" fill="var(--color-secondary)" />
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M30.4096 30.8C30.4096 28.3 26.25 23.75 20 23.75C13.75 23.75 9.09535 27.8 9.09535 30.3C11.5 32.8 15.499 35.0002 20 35C24.501 34.9998 28 33.3 30.4096 30.8Z"
            fill="currentColor"
        />
        <path
            d="M25 16.25C25 19.0114 22.7614 21.25 20 21.25C17.2386 21.25 15 19.0114 15 16.25C15 13.4886 17.2386 11.25 20 11.25C22.7614 11.25 25 13.4886 25 16.25Z"
            fill="currentColor"
        />
        <path
            d="M20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35ZM20 35C15.499 35.0002 11.5 32.8 9.09535 30.3C9.09535 27.8 13.75 23.75 20 23.75C26.25 23.75 30.4096 28.3 30.4096 30.8C28 33.3 24.501 34.9998 20 35ZM25 16.25C25 19.0114 22.7614 21.25 20 21.25C17.2386 21.25 15 19.0114 15 16.25C15 13.4886 17.2386 11.25 20 11.25C22.7614 11.25 25 13.4886 25 16.25Z"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35ZM20 35C15.499 35.0002 11.5 32.8 9.09535 30.3M20 35C24.501 34.9998 28 33.3 30.4096 30.8"
            stroke="var(--color-secondary)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{/if}
