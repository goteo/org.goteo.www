<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        text: string;
        class?: ClassNameValue;
    }

    let { text, class: classes = "" }: Props = $props();
</script>

<div
    class={twMerge(
        "bg-white rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap text-black shadow-md",
        classes,
    )}
>
    {text}
</div>
