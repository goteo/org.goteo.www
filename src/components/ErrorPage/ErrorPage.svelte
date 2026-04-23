<script lang="ts">
    import Button from "../library/Button.svelte";

    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        subtitle: string;
        ctaText: string;
        ctaHref?: string;
        code: number;
        children?: Snippet;
    }

    let { title, subtitle, ctaText, ctaHref = "/", code, children }: Props = $props();
</script>

<section
    class="relative mb-8 flex min-h-87.5 flex-col items-center justify-center overflow-hidden sm:mb-14 sm:min-h-150"
>
    <span
        class="text-grey pointer-events-none absolute z-0 text-[200px] leading-none select-none sm:text-[500px] lg:text-[790px]"
    >
        {code}
    </span>
    <div class="item-center relative z-10 flex aspect-89/77 w-full max-w-200 justify-center backdrop-filter-[blur(7.049632549285889px)] rounded-[70px]">
        <div class="w-full origin-center scale-50">
            {@render children?.()}
        </div>
    </div>
    <div
        class="relative z-10 flex w-full max-w-full flex-col items-center gap-4 px-4 pb-6 text-center sm:absolute sm:bottom-0 sm:max-w-192.5 sm:gap-6 sm:pb-0"
    >
        <h1 class="text-3xl leading-tight font-bold text-black sm:text-5xl">
            {title}
        </h1>
        <p class="text-content text-sm sm:text-base">
            {subtitle}
        </p>
        <a href={ctaHref}>
            <Button>{ctaText}</Button>
        </a>
    </div>
</section>
