<script>
    export let src;
    export let alt;
    export let href = null;
    export let width = "80";
    export let height = "40";
    export let special = false;
    export let ariaLabel = null;
    export let customClass = "";
</script>

{#if href}
    <a
        {href}
        class="focus:ring-soft-purple focus:ring-offset-soft-purple rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
        aria-label={ariaLabel || `Visit ${alt} website`}
    >
        <img
            {src}
            {alt}
            {width}
            {height}
            loading="lazy"
            class={customClass ||
                (special
                    ? "h-10 rounded-lg bg-white object-cover p-1 transition-opacity hover:opacity-90 sm:h-12 sm:p-2 md:h-14"
                    : "h-10 rounded-lg object-cover transition-opacity hover:opacity-90 sm:h-12 md:h-14")}
        />
    </a>
{:else}
    <img
        {src}
        {alt}
        {width}
        {height}
        loading="lazy"
        class={customClass || "h-8 w-auto transition-opacity hover:opacity-90 sm:h-10"}
    />
{/if}
