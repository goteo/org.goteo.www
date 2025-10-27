<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        text: string;
        class?: string;
    }

    let { text, class: className = "" }: Props = $props();
</script>

<div
    class={twMerge(
        "rounded-full bg-white px-4 py-2 text-sm font-bold whitespace-nowrap text-black shadow-md",
        className,
    )}
>
    {text}
</div>
