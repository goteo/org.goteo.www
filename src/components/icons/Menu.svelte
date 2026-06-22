<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4 5.33333C4 4.59695 4.48842 4 5.09091 4H26.9091C27.5116 4 28 4.59695 28 5.33333C28 6.06971 27.5116 6.66667 26.9091 6.66667H5.09091C4.48842 6.66667 4 6.06971 4 5.33333ZM4 16C4 15.2636 4.48842 14.6667 5.09091 14.6667H26.9091C27.5116 14.6667 28 15.2636 28 16C28 16.7364 27.5116 17.3333 26.9091 17.3333H5.09091C4.48842 17.3333 4 16.7364 4 16ZM4 26.6667C4 25.9303 4.48842 25.3333 5.09091 25.3333H26.9091C27.5116 25.3333 28 25.9303 28 26.6667C28 27.403 27.5116 28 26.9091 28H5.09091C4.48842 28 4 27.403 4 26.6667Z"
        fill="currentColor"
    />
</svg>
