<script lang="ts">
    import HomeBanner from "./HomeBanner.svelte";
    import { t } from "../../i18n/store";

    import type { BannerRecord } from "../../repositories/banners";

    interface Props {
        banners: BannerRecord[];
    }

    let { banners }: Props = $props();
</script>

{#if banners.length > 0}
    <section class="wrapper flex flex-col gap-4">
        {#each banners as banner (banner.id)}
            <HomeBanner
                id={banner.id}
                title={banner.title}
                description={banner.content}
                ctaText={banner.ctaText}
                ctaLink={banner.ctaLink}
                closeAriaLabel={$t("pages.home.banner.closeAriaLabel")}
            />
        {/each}
    </section>
{/if}
