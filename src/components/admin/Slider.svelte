<script lang="ts">
    import { onMount } from "svelte";

    import "flickity/css/flickity.css";
    import TotalizerCard from "./TotalizerCard.svelte";
    import Loader from "../library/feedback/Loader.svelte";

    import type { Options } from "flickity";

    let {
        slides = [],
        isLoading = false,
    }: { slides?: { title: string; amount: string | number }[]; isLoading?: boolean } = $props();

    let mainCarousel: HTMLDivElement;
    let isSliderLoaded = $state(false);

    let options: Options = {
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

    const loadFlickity = async (elem: HTMLElement) => {
        try {
            const { default: FlickityClass } = await import("flickity");
            new FlickityClass(elem, options);
            isSliderLoaded = true;
        } catch (err) {
            console.error("Flickity failed to load:", err);
        }
    };

    onMount(() => {
        if (mainCarousel) loadFlickity(mainCarousel);
    });
</script>

<div class="relative mt-6 h-40">
    {#if isLoading}
        <div class="absolute inset-0 flex items-center justify-center">
            <Loader />
        </div>
    {/if}

    <div
        bind:this={mainCarousel}
        class="main-carousel h-full first:ml-0"
        class:opacity-0={isLoading}
    >
        {#each slides as { title, amount }}
            <TotalizerCard class="ml-6 h-40.5 w-80.5" {title} value={amount} />
        {/each}
    </div>
</div>

<style>
    :global(.flickity-button-icon) {
        fill: var(--color-secondary);
    }

    :global(.flickity-prev-next-button.previous),
    :global(.flickity-prev-next-button.next) {
        background: var(--color-variant1);
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
