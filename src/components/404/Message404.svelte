<script lang="ts">
    import Illustration404 from "./Illustration404.svelte";
    import { t } from "../../i18n/store";
</script>

<section
    class="relative mb-8 flex min-h-87.5 flex-col items-center justify-center overflow-hidden sm:mb-14 sm:min-h-150"
>
    <span
        class="text-grey pointer-events-none absolute z-0 text-[200px] leading-none select-none sm:text-[500px] lg:text-[790px]"
    >
        404
    </span>
    <div class="relative z-10 w-full max-w-full px-4 sm:bottom-20 sm:max-w-202.25 sm:px-0">
        <Illustration404 />
    </div>
    <div
        class="relative z-10 flex w-full max-w-full flex-col items-center gap-4 px-4 pb-6 text-center sm:absolute sm:bottom-0 sm:max-w-192.5 sm:gap-6 sm:pb-0"
    >
        <h1 id="error-404-heading" class="text-3xl leading-tight font-bold text-black sm:text-5xl">
            {$t("pages.404.title")}
        </h1>
        <p class="text-content text-sm sm:text-base">{$t("pages.404.subtitle")}</p>
        <a
            href="/"
            class="bg-primary text-secondary rounded-3xl px-8 py-4 font-bold transition hover:cursor-pointer"
        >
            {$t("common.goHome")}
        </a>
    </div>
</section>
