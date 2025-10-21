<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        text: string;
        class?: string;
    }

    let { text, class: className = "" }: Props = $props();

    const baseStyle = [
        "rounded-full",
        "bg-white",
        "px-4",
        "py-2",
        "shadow-md",
        "text-sm",
        "font-bold",
        "whitespace-nowrap",
        "text-black"
    ];
</script>

<div class={twMerge(baseStyle.join(" "), className)}>
    {text}
</div>