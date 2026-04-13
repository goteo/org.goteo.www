<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        sign?: string;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "32", height = "32", sign = "more" }: Props = $props();
</script>

{#if sign == "more"}
    <!--More-->
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
            d="M16 5C9.92487 5 5 9.92487 5 16C5 22.0751 9.92487 27 16 27C22.0751 27 27 22.0751 27 16C27 9.92487 22.0751 5 16 5ZM3 16C3 8.8203 8.8203 3 16 3C23.1797 3 29 8.8203 29 16C29 23.1797 23.1797 29 16 29C8.8203 29 3 23.1797 3 16ZM16 11C16.5523 11 17 11.4477 17 12V15H20C20.5523 15 21 15.4477 21 16C21 16.5523 20.5523 17 20 17H17V20C17 20.5523 16.5523 21 16 21C15.4477 21 15 20.5523 15 20V17H12C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15H15V12C15 11.4477 15.4477 11 16 11Z"
            fill="currentColor"
        />
    </svg>
{:else if sign == "less"}
    <!--Less-->
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
            d="M15.9586 5C9.88349 5 4.95862 9.92487 4.95862 16C4.95862 22.0751 9.88349 27 15.9586 27C22.0338 27 26.9586 22.0751 26.9586 16C26.9586 9.92487 22.0338 5 15.9586 5ZM2.95862 16C2.95862 8.8203 8.77892 3 15.9586 3C23.1383 3 28.9586 8.8203 28.9586 16C28.9586 23.1797 23.1383 29 15.9586 29C8.77892 29 2.95862 23.1797 2.95862 16ZM10.9586 16C10.9586 15.4477 11.4063 15 11.9586 15H19.9586C20.5109 15 20.9586 15.4477 20.9586 16C20.9586 16.5523 20.5109 17 19.9586 17H11.9586C11.4063 17 10.9586 16.5523 10.9586 16Z"
            fill="currentColor"
        />
    </svg>
{/if}
