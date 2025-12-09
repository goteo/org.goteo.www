<script lang="ts">
    import { type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        iconColor?: string;
    }
    let { class: classes, iconColor }: Props = $props();

    const variantColor = `stroke-${iconColor ? `[${iconColor}]` : "[#464646]"}`;
</script>

<svg
    class={classes ? classes : ""}
    width="15"
    height="18"
    viewBox="0 0 15 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        class={variantColor}
        d="M6 1.50003H2.25C1.42157 1.50003 0.75 2.1716 0.75 3.00003V17.25L6.75 12.75L12.75 17.25V8.25003M14.25 0.750031L11.25 4.50003L9.75 2.70003"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
