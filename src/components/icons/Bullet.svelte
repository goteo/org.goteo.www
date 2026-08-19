<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        size?: number;
    }

    let { class: classes = "", size = 12 }: Props = $props();
</script>

<svg
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-tertiary", classes)}
>
    <circle cx={size / 2} cy={size / 2} r={size / 2} />
</svg>
