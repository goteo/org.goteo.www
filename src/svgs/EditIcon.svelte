<script lang="ts">
    import { type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        iconColor?: string;
    }
    let { class: classes, iconColor }: Props = $props();

    let variantColor = $derived(iconColor ? `${iconColor}` : "#462949");
</script>

<svg
    class={classes ? classes : ""}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 17 17"
    ><path
        stroke={variantColor}
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M2.25 10.5 6 14.25M9.75 3l3.75 3.75m-1.5-6 3.75 3.75L4.5 15.75H.75V12z"
    /></svg
>
