<script lang="ts">
    import type { ClassNameValue } from "tailwind-merge";

    let {
        class: classes,
        width = "16",
        height = "16",
    } = $props<{
        class?: ClassNameValue;
        width?: string;
        height?: string;
    }>();
</script>

<svg
    class={classes}
    {width}
    {height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        d="M10 10L13 13"
        stroke="#462949"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <circle
        cx="7"
        cy="7"
        r="4"
        stroke="#462949"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
