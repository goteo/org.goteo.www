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
    class="pointer-events-none absolute z-0 select-none font-bold leading-[1.17] text-grey font-body text-[150px] sm:text-[400px] lg:text-[780px]"
>
    {code}
</span>

    <div class="z-10 flex flex-col justify-center w-full max-w-[95%] sm:max-w-200 aspect-square sm:aspect-89/77 px-6 py-10 sm:px-0 rounded-[40px] sm:rounded-[70px] bg-white/10 backdrop-blur-md">

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
