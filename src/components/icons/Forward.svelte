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
        d="M16 27C22.0751 27 27 22.0751 27 16C27 9.92487 22.0751 5 16 5C9.92487 5 5 9.92487 5 16C5 22.0751 9.92487 27 16 27ZM29 16C29 23.1797 23.1797 29 16 29C8.8203 29 3 23.1797 3 16C3 8.82029 8.8203 3 16 3C23.1797 3 29 8.8203 29 16ZM16.2929 20.7071C15.9024 20.3166 15.9024 19.6834 16.2929 19.2929L18.5858 17L11 17C10.4477 17 10 16.5523 10 16C10 15.4477 10.4477 15 11 15L18.5858 15L16.2929 12.7071C15.9024 12.3166 15.9024 11.6834 16.2929 11.2929C16.6834 10.9024 17.3166 10.9024 17.7071 11.2929L21.7071 15.2929C22.0976 15.6834 22.0976 16.3166 21.7071 16.7071L17.7071 20.7071C17.3166 21.0976 16.6834 21.0976 16.2929 20.7071Z"
    />
</svg>
