<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string;
        height?: string;
    }

    let { class: classes = "", width = "24px", height = "24px" }: Props = $props();
</script>

<span
    class={twMerge(
        "box-border inline-block animate-spin rounded-full border-[0.15em] border-current border-b-transparent",
        classes,
    )}
    style="width: {width}; height: {height};"
></span>
