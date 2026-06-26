<script lang="ts">
    import { onMount } from "svelte";

    import "flickity/css/flickity.css";
    import TotalizerCard from "./TotalizerCard.svelte";
    import { session } from "../../auth/store";
    import { t } from "../../i18n/store";
    import { apiAccountingsIdGet, apiTipjarsIdGet } from "../../openapi/client/sdk.gen";
    import { totalItems, isLoading } from "../../stores/chargesPaginationAndSort";
    import { formatCurrency } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import { isEnabled, tipjarId } from "../../utils/tipping";

    import type { Options } from "flickity";

    let mainCarousel: HTMLDivElement;
    let isSliderLoaded = $state(false);
    let totalTips = $state<string>("—");

    async function loadTotalTips() {
        if (!isEnabled || !$session) return;
        const headers = $session.token.asHttpHeaders;

        const { data: tipjar } = await apiTipjarsIdGet({ path: { id: tipjarId }, headers });
        const accountingId = tipjar?.accounting ? extractId(tipjar.accounting) : null;
        if (!accountingId) return;

        const { data: accounting } = await apiAccountingsIdGet({
            path: { id: accountingId },
            headers,
        });
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
                title: $t("pages.admin.projects.totalizers.selected"),
                amount: $totalItems,
            },
            { title: $t("domain.charges.totalizers.totalCharges"), amount: "—" },
            { title: $t("domain.charges.totalizers.totalTips"), amount: totalTips },
            { title: $t("domain.charges.totalizers.totalFees"), amount: "—" },
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
            <span class="text-content">{$t("pages.search.pagination.loading")}</span>
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
