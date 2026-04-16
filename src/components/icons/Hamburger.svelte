<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        close?: boolean;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "40", height = "40", close = false }: Props = $props();
</script>

{#if close === false}
    <!-- Menu -->
    <svg
        {width}
        {height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-secondary", classes)}
    >
        <rect width="40" height="40" rx="8" fill="currentColor" />
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11 12C11 11.4477 11.3663 11 11.8182 11H28.1818C28.6337 11 29 11.4477 29 12C29 12.5523 28.6337 13 28.1818 13H11.8182C11.3663 13 11 12.5523 11 12ZM11 20C11 19.4477 11.3663 19 11.8182 19H28.1818C28.6337 19 29 19.4477 29 20C29 20.5523 28.6337 21 28.1818 21H11.8182C11.3663 21 11 20.5523 11 20ZM11 28C11 27.4477 11.3663 27 11.8182 27H28.1818C28.6337 27 29 27.4477 29 28C29 28.5523 28.6337 29 28.1818 29H11.8182C11.3663 29 11 28.5523 11 28Z"
            fill="white"
        />
    </svg>
{:else if close === true}
    <!-- Close -->
    <svg
        {width}
        {height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class={twMerge("text-secondary", classes)}
    >
        <rect width="40" height="40" rx="8" fill="currentColor" />
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12.7197 12.7197C13.0126 12.4268 13.4874 12.4268 13.7803 12.7197L20 18.9393L26.2197 12.7197C26.5126 12.4268 26.9874 12.4268 27.2803 12.7197C27.5732 13.0126 27.5732 13.4874 27.2803 13.7803L21.0607 20L27.2803 26.2197C27.5732 26.5126 27.5732 26.9874 27.2803 27.2803C26.9874 27.5732 26.5126 27.5732 26.2197 27.2803L20 21.0607L13.7803 27.2803C13.4874 27.5732 13.0126 27.5732 12.7197 27.2803C12.4268 26.9874 12.4268 26.5126 12.7197 26.2197L18.9393 20L12.7197 13.7803C12.4268 13.4874 12.4268 13.0126 12.7197 12.7197Z"
            fill="white"
        />
    </svg>
{/if}
