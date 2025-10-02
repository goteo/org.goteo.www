<script lang="ts">
    interface Props {
        class?: string;
        width?: string | number;
        height?: string | number;
    }

    let { class: className = "", width = "32", height = "32" }: Props = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    {width}
    {height}
    viewBox="0 0 32 32"
    fill="none"
    class={className}
>
    <path
        d="M13.0579 27.0273C10.1158 20.0546 15 16 15 16C15 16 15 25 20 22C20 22 20 26.9 17 27.9M20 16C23 16 23 12 23 12C23 12 25 14 25 19C25 24 22 28 16.0025 28C10.0051 28 7 23.9983 7 19C7 12 14 12 14 4C14 4 20 8 20 16Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
    ></path>
</svg>
