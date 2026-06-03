<script lang="ts">
    import { onMount } from "svelte";

    import "flickity/css/flickity.css";
    import TotalizerCard from "./TotalizerCard.svelte";
    import { t } from "../../i18n/store";
    import { totalItems, isLoading } from "../../stores/chargesPaginationAndSort";
    import { fetchAccounting, fetchTipjar } from "../../utils/cachedFetch";
    import { formatCurrency } from "../../utils/currencies";
    import { isEnabled, tipjarIri } from "../../utils/tipping";

    import type { Options } from "flickity";

    const CACHE_NAME = "charges-cache";

    let mainCarousel: HTMLDivElement;
    let isSliderLoaded = $state(false);
    let totalTips = $state<string>("—");

    function getAccessToken(): string | null {
        const match = document.cookie.match(/(?:^|;\s*)access-token=([^;]*)/);
        if (!match) return null;
        try {
            const decoded = decodeURIComponent(match[1]);
            const parsed = JSON.parse(decoded);
            return parsed?.token ?? null;
        } catch {
            return null;
        }
    }

    async function loadTotalTips() {
        if (!isEnabled) return;
        const token = getAccessToken();
        if (!token) return;
        const tipjar = await fetchTipjar(tipjarIri, token, CACHE_NAME);
        if (!tipjar?.accounting) return;
        const accounting = await fetchAccounting(tipjar.accounting, token, CACHE_NAME);
        if (accounting?.balance) {
            totalTips = formatCurrency(accounting.balance.amount, accounting.balance.currency);
        }
    }

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
        return [
            {
                title: $t("admin.projects.totalizers.selected"),
                amount: $totalItems,
            },
            { title: $t("admin.charges.totalizers.totalCharges"), amount: "—" },
            { title: $t("admin.charges.totalizers.totalTips"), amount: totalTips },
            { title: $t("admin.charges.totalizers.totalFees"), amount: "—" },
        ];
    };

    const loadFlickity = async (elem: HTMLElement) => {
        try {
            const FlickityModule = await import("flickity");
            const FlickityClass = FlickityModule.default;
            new FlickityClass(elem, options);
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
        loadTotalTips();
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
