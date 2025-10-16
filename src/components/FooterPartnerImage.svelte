<script>
    import { twMerge } from "tailwind-merge";

    let { src, alt, href = null, ariaLabel = null, class: customClass = "" } = $props();

    const defaultImageClasses =
        "h-10 w-auto rounded-lg transition-opacity hover:opacity-90 sm:h-12 md:h-14";
    const defaultImageClassesWithoutLink = "h-8 w-auto transition-opacity hover:opacity-90 sm:h-10";
</script>

{#if href}
    <a
        {href}
        class="focus:ring-soft-purple focus:ring-offset-soft-purple rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
        aria-label={ariaLabel || `Visit ${alt} website`}
    >
        <img {src} {alt} loading="lazy" class={twMerge(defaultImageClasses, customClass)} />
    </a>
{:else}
    <img {src} {alt} loading="lazy" class={twMerge(defaultImageClassesWithoutLink, customClass)} />
{/if}
