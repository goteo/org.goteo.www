<script lang="ts">
    import { onMount } from "svelte";

    import HomeBanner from "./HomeBanner.svelte";
    import { t } from "../../i18n/store";
    import { getCookie, setCookie } from "../../utils/cookies";

    import type { BannerRecord } from "../../repositories/banners";

    const CLOSED_BANNERS_COOKIE = "goteo-banners-closed";

    interface Props {
        banners: BannerRecord[];
    }

    let { banners }: Props = $props();

    let closed = $state<string[]>([]);

    function getClosed() {
        return (getCookie(CLOSED_BANNERS_COOKIE) ?? "").split(",").filter(Boolean);
    }

    onMount(() => {
        closed = getClosed();
    });

    $effect(() => {
        closed = getClosed();
    });

    let visibleBanners = $derived(banners.filter((banner) => !closed.includes(String(banner.id))));

    function handleClose(id: number) {
        if (closed.includes(String(id))) return;

        closed = [...closed, String(id)];
        setCookie(CLOSED_BANNERS_COOKIE, closed.join(","));
    }
</script>

{#if visibleBanners.length > 0}
    <section class="wrapper flex flex-col gap-4">
        {#each visibleBanners as banner (banner.id)}
            <HomeBanner
                title={banner.title}
                description={banner.content}
                ctaText={banner.ctaText}
                ctaLink={banner.ctaLink}
                closeAriaLabel={$t("pages.home.banner.closeAriaLabel")}
                onClose={() => handleClose(banner.id)}
            />
        {/each}
    </section>
{/if}
