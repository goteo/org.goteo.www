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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.93325 5.2L23.2666 15.2C23.7084 15.5314 23.798 16.1582 23.4666 16.6C23.4097 16.6758 23.3424 16.7431 23.2666 16.8L9.93325 26.8C9.49142 27.1314 8.86462 27.0418 8.53325 26.6C8.40343 26.4269 8.33325 26.2164 8.33325 26V6C8.33325 5.44772 8.78097 5 9.33325 5C9.54962 5 9.76016 5.07018 9.93325 5.2Z"
        fill="currentColor"
    />
</svg>
