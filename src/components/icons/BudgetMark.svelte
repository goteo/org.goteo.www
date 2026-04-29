<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    const fillColors = {
        tarea: "var(--color-secondary)",
        material: "var(--color-tertiary)",
        infraestructura: "var(--color-variant2)",
    };

    interface Props {
        class?: ClassNameValue;
        variant: keyof typeof fillColors;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "24", height = "24", variant }: Props = $props();

    const fillColor = $derived(fillColors[variant]);
</script>

<svg
    {width}
    {height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge(classes)}
>
    <rect x="2" y="7" width="20" height="10" rx="5" fill={fillColor} />
</svg>
