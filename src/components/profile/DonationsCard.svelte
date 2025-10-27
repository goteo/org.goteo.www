<script lang="ts">
    import BaseActivityCard from "./BaseActivityCard.svelte";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import type { ActivityData } from "../../types/me-page";

    interface Props {
        /**
         * Current language locale
         */
        lang: string;

        /**
         * Optional activity data for filled state
         * If undefined/null, shows empty state
         */
        data?: ActivityData;
    }

    let { lang, data }: Props = $props();

    const fallbackProjectTitle = $derived(lang === "es" ? "Proyecto" : "Project");

    // Determine if this card has data
    const hasData = $derived(!!(data?.donations && data.donations.count > 0));

    // Get donations data
    const donationsData = $derived(data?.donations);

    // Formatted total
    const formattedTotal = $derived(
        donationsData?.total
            ? formatAmountWithSymbol(donationsData.total.amount, donationsData.total.currency, lang)
            : "",
    );
</script>

<BaseActivityCard
    titleKey="me.donations.title"
    leftStatLabel="me.donations.count"
    leftStatValue={donationsData?.count ?? 0}
    rightStatLabel="me.donations.total"
    rightStatValue={formattedTotal}
    recentTitleKey="me.donations.recent"
    illustrationPath="/images/profile/ilustration-donations.png"
    primaryActionLabel="me.donations.viewAll"
    primaryActionHref={lang === "es" ? "/me/donations" : `/${lang}/me/donations`}
    secondaryActionLabel="me.donations.certificate"
    secondaryActionHref="#"
    isEmpty={!hasData}
    emptyMessageKey="me.donations.empty"
    emptyCtaLabel="me.donations.explore"
    emptyCtaLink={lang === "es" ? "/discover" : `/${lang}/discover`}
>
    {#if donationsData?.recentDonations}
        {#each donationsData.recentDonations.slice(0, 2) as donation}
            <li class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-black">
                    {formatAmountWithSymbol(donation.amount.amount, donation.amount.currency, lang)}
                </span>
                <span class="text-sm font-semibold text-black"> - </span>
                <a
                    href={lang === "es"
                        ? `/projects/${donation.projectSlug}`
                        : `/${lang}/projects/${donation.projectSlug}`}
                    class="text-secondary text-sm no-underline hover:underline focus:underline focus:outline-none"
                >
                    {donation.projectTitle || fallbackProjectTitle}
                </a>
            </li>
        {/each}
    {/if}
</BaseActivityCard>
