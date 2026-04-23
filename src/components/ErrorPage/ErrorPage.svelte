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

<section class="flex min-h-[85dvh] flex-col items-center justify-center">
    <span
        class="text-grey pointer-events-none absolute z-0 text-[200px] leading-none font-extrabold select-none sm:text-[500px] lg:text-[790px]"
    >
        {code}
    </span>
    <div class="z-10 flex aspect-89/77 max-w-200 flex-col justify-center px-4 sm:px-0">
        <div class="mx-auto w-[42%]">
            {@render children?.()}
        </div>
        <div class="flex flex-col gap-4">
            <h1 class="text-center text-3xl leading-tight font-bold text-black sm:text-6xl">
                {title}
            </h1>
            <p class="text-content text-center text-sm sm:text-base">
                {subtitle}
            </p>
            <a class="flex justify-center" href={ctaHref}>
                <Button>{ctaText}</Button>
            </a>
        </div>
    </div>
</section>
