<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        iconColor?: string;
    }
    let { class: classes, iconColor }: Props = $props();

    let variantColor = $derived(iconColor ? `${iconColor}` : "#462949");
</script>

<svg
    class={twMerge("size-4", classes)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 14 14"
    ><path
        stroke={variantColor}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M4.5 7h2m-2-2h5m-8-2.5v10l2.5-2h7.5a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1"
    /></svg
>
