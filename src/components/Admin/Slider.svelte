<script lang="ts">
    import { onMount } from "svelte";
    import "flickity/css/flickity.css";
    import type Flickity from "flickity";
    import type { Options } from "flickity";
    import TotalizerCard from "./TotalizerCard.svelte";
    import { t } from "../../i18n/store";
    import { totalItems, isLoading } from "../../stores/chargesPaginationAndSort";

    let mainCarousel: HTMLDivElement;
    let flickity: Flickity;
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

    let slides: { title: string; amount: string | number }[] = $state([]);

    const loadSlides = () => {
        let slidesArr = [];

        // Example dynamic data, just for testing. Pending real data integration.
        slidesArr.push({
            title: $t("admin.projects.totalizers.selectedCampaigns"),
            amount: $totalItems,
        });
        slidesArr.push({ title: $t("admin.charges.totalizers.totalCharges"), amount: "250,98€" });
        slidesArr.push({ title: $t("admin.charges.totalizers.totalTips"), amount: "250,96€" });
        slidesArr.push({ title: $t("admin.charges.totalizers.totalFees"), amount: "250,97€" });

        return slidesArr;
    };

    const loadFlickity = async (elem: HTMLElement) => {
        try {
            const FlickityModule = await import("flickity");
            const FlickityClass = FlickityModule.default;
            flickity = new FlickityClass(elem, options);
            isSliderLoaded = true;
        } catch (err) {
            console.error("Flickity failed to load:", err);
        }
    };

    $effect(() => {
        slides = loadSlides();
    });

    onMount(() => {
        loadSlides();
        if (mainCarousel) loadFlickity(mainCarousel);
    });
</script>

<div class="relative mt-6 h-40">
    {#if !isSliderLoaded || $isLoading}
        <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-content">{$t("search.pagination.loading")}</span>
        </div>
    {/if}

    <div
        bind:this={mainCarousel}
        class="main-carousel h-full first:ml-0 opacity-{isSliderLoaded && !$isLoading ? 100 : 0}"
    >
        {#each slides as { title, amount }}
            <TotalizerCard class="ml-6 h-[162px] w-[322px]" {title} value={amount} />
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
