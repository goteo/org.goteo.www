<script lang="ts">
    import { type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        iconColor?: string;
    }
    let { class: classes, iconColor }: Props = $props();

    const variantColor = iconColor ?
        `stroke-[${iconColor}]` :
        "stroke-tertiary";
</script>

<svg
    class={classes ? classes : ""}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        class={variantColor}
        d="M6.75 6.75L12.75 12.75M12.75 6.75L6.75 12.75M9.75 0.75C14.7206 0.75 18.75 4.77944 18.75 9.75C18.75 14.7206 14.7206 18.75 9.75 18.75C4.77944 18.75 0.75 14.7206 0.75 9.75C0.75 4.77944 4.77944 0.75 9.75 0.75Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
