<script lang="ts">
    import type { ClassNameValue } from "tailwind-merge";

    let { width = "27", height = "31", class: className } = $props<{
        width?: string;
        height?: string;
        class?: ClassNameValue;
    }>();
</script>

<svg {width} {height} viewBox="0 0 27 31" fill="none" xmlns="http://www.w3.org/2000/svg" class={className}>
    <path
        d="M25.0908 27.4756H18.5454M22.3635 20.4756V24.7833M22.3635 20.4756L19.6363 22.6294M22.3635 20.4756L25.0908 22.6294M15.2726 29.0909H3.27264C2.06765 29.0909 1.09082 28.1266 1.09082 26.9371V3.24479C1.09082 2.05525 2.06765 1.09094 3.27264 1.09094H18.5454M18.5454 1.09094L25.0908 7.55248M18.5454 1.09094V7.55248H25.0908M25.0908 7.55248V17.2448M7.63628 20.4756H11.9999M7.63628 16.1679H18.5454M7.63628 11.8602H18.5454"
        stroke="#462949"
        stroke-width="2.18182"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
