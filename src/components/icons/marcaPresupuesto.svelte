<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        variant: "tarea" | "material" | "infraestructura";
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "24", height = "24", variant }: Props = $props();

    const fillColor = $derived(
        {
            tarea: "var(--color-secondary)",
            material: "var(--color-tertiary)",
            infraestructura: "var(--color-variant2)",
        }[variant],
    );
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
