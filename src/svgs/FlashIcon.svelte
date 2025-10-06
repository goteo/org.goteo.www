<script lang="ts">
    interface Props {
        class?: string;
        width?: string | number;
        height?: string | number;
    }

    let { class: className = "", width = "17", height = "16" }: Props = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    {width}
    {height}
    viewBox="0 0 17 16"
    fill="none"
    class={className}
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.1 1.6001L9.03334 6.93353H12.2334L6.89997 14.3993L7.96666 9.0664H4.7666L10.1 1.6001Z"
        stroke="currentColor"
        stroke-width="1.06669"
        stroke-linecap="round"
        stroke-linejoin="round"
    ></path>
</svg>
