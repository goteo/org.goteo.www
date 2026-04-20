<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "24", height = "24" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 32 32"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16 5C9.92487 5 5 9.92487 5 16C5 22.0751 9.92487 27 16 27C22.0751 27 27 22.0751 27 16C27 9.92487 22.0751 5 16 5ZM3 16C3 8.8203 8.8203 3 16 3C23.1797 3 29 8.8203 29 16C29 23.1797 23.1797 29 16 29C8.8203 29 3 23.1797 3 16ZM15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L13.4142 15H21C21.5523 15 22 15.4477 22 16C22 16.5523 21.5523 17 21 17H13.4142L15.7071 19.2929C16.0976 19.6834 16.0976 20.3166 15.7071 20.7071C15.3166 21.0976 14.6834 21.0976 14.2929 20.7071L10.2929 16.7071C9.90237 16.3166 9.90237 15.6834 10.2929 15.2929L14.2929 11.2929C14.6834 10.9024 15.3166 10.9024 15.7071 11.2929Z"
    />
</svg>
