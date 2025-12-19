<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        title,
        value,
        class: classes = "",
    }: {
        title: string;
        value: string | number;
        class?: ClassNameValue;
    } = $props();
</script>

<div
    class={twMerge(
        "border-variant1 bg-soft-purple flex flex-col items-start justify-center gap-2 rounded-2xl border px-10 py-8 shadow-sm shadow-[#000]/10",
        classes,
    )}
>
    <span class="text-content text-base leading-6 font-bold">
        {title}
    </span>
    <span class="text-[2.5rem] leading-12 font-medium text-black">
        {value}
    </span>
</div>
