<script lang="ts">
    import { twMerge } from "tailwind-merge";

    let {
        i18n,
        class: classes = "",
    }: {
        i18n: { title: string; value: string };
        class?: string;
    } = $props();
</script>

<div
    class={twMerge(
        "border-variant1 bg-soft-purple flex flex-col gap-2 items-start justify-center rounded-2xl border px-10 py-8 shadow-sm shadow-[#000]/10",
        classes,
    )}
>
    <span class="text-content text-base font-bold leading-6">
        {i18n.title}
    </span>
    <span class="text-black text-[2.5rem] font-medium leading-12">
        {i18n.value}
    </span>
</div>
