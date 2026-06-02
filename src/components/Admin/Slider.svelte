<script lang="ts">
    import { onMount } from "svelte";

    import "flickity/css/flickity.css";
    import TotalizerCard from "./TotalizerCard.svelte";
    import { t } from "../../i18n/store";
    import { totalItems, isLoading as chargesIsLoading } from "../../stores/chargesPaginationAndSort";

    import type { Options } from "flickity";
    import type Flickity from "flickity";

    let {
        slides: slidesProp,
        loading: loadingProp,
    } = $props<{
        slides?: { title: string; amount: string | number }[];
        loading?: boolean;
    }>();

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
        if (slidesProp) return slidesProp;

        let slidesArr = [];
        slidesArr.push({
            title: $t("admin.projects.totalizers.selected"),
            amount: $totalItems,
        });
        slidesArr.push({ title: $t("admin.charges.totalizers.totalCharges"), amount: "" });
        slidesArr.push({ title: $t("admin.charges.totalizers.totalTips"), amount: "" });
        slidesArr.push({ title: $t("admin.charges.totalizers.totalFees"), amount: "" });

        return slidesArr;
    };

    let isDataLoading = $derived(loadingProp ?? $chargesIsLoading);

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
    {#if !isSliderLoaded || isDataLoading}
        <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-content">{$t("system.loading")}</span>
        </div>
    {/if}

    <div
        bind:this={mainCarousel}
        class="main-carousel h-full first:ml-0 opacity-{isSliderLoaded && !isDataLoading ? 100 : 0}"
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
