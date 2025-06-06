<script lang="ts">
    import { onMount } from "svelte";
    import "flickity/css/flickity.css";
    import type Flickity from "flickity";
    import type { Options } from "flickity";

    let mainCarousel: HTMLDivElement;
    let flickity: Flickity;
    let isLoaded = false;

    export let options: Options = {
        cellAlign: "left",
        contain: true,
        groupCells: 4,
        pageDots: false,
        arrowShape: {
            x0: 10,
            x1: 60,
            y1: 35,
            x2: 60,
            y2: 0,
            x3: 60,
        },
    };

    export let slides: { title: string; amount: string | number }[] = [];

    const loadFlickity = async (elem: HTMLElement) => {
        try {
            const FlickityModule = await import("flickity");
            const FlickityClass = FlickityModule.default;
            flickity = new FlickityClass(elem, options);
            isLoaded = true;
        } catch (err) {
            console.error("Flickity failed to load:", err);
        }
    };

    onMount(() => {
        if (mainCarousel) loadFlickity(mainCarousel);
    });
</script>

<div class="relative h-[160px]">
    {#if !isLoaded}
        <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-[#575757]">Cargando...</span>
        </div>
    {/if}

    <div bind:this={mainCarousel} class="main-carousel h-full opacity-{isLoaded ? 100 : 0}">
        {#each slides as { title, amount }}
            <div
                class="carousel-cell mr-6 flex h-full w-[22.5%] flex-col items-start justify-center gap-4 rounded-xl border border-[#e6e5f7] bg-[#faf9ff] p-8 shadow-[0px_1px_3px_0px_#0000001A]"
            >
                <span class="text-base font-semibold text-[#575757]">{title}</span>
                <span class="text-secondary text-[40px]">{amount}</span>
            </div>
        {/each}
    </div>
</div>

<style>
    :global(.flickity-button-icon) {
        fill: #462949;
    }

    :global(.flickity-prev-next-button.previous),
    :global(.flickity-prev-next-button.next) {
        background: #e6e5f7;
        width: 40px;
        height: 40px;
    }

    :global(.flickity-prev-next-button.previous) {
        left: -10px;
    }

    :global(.flickity-prev-next-button.next) {
        right: -10px;
    }
</style>
