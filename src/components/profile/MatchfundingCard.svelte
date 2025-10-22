<script lang="ts">
    import BaseActivityCard from "./BaseActivityCard.svelte";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import type { MatchfundingCardData } from "../../types/me-page";

    interface Props {
        /**
         * Current language locale
         */
        lang: string;

        /**
         * Optional matchfunding data for filled state
         * If undefined/null, card is not shown
         */
        data?: MatchfundingCardData;
    }

    let { lang, data }: Props = $props();

    const hasData = $derived(!!(data && data.totalCalls > 0));
    const formattedTotal = $derived(
        data?.totalDonated
            ? formatAmountWithSymbol(data.totalDonated.amount, data.totalDonated.currency, lang)
            : "",
    );
</script>

{#if hasData}
    <BaseActivityCard
        titleKey="me.matchfunding.card.title"
        leftStatLabel="me.matchfunding.card.calls"
        leftStatValue={data?.totalCalls ?? 0}
        rightStatLabel="me.matchfunding.card.donated"
        rightStatValue={formattedTotal}
        recentTitleKey="me.matchfunding.card.recent"
        illustrationPath="/images/profile/ilustration-matchfunding.png"
        primaryActionLabel="me.matchfunding.card.viewAll"
        primaryActionHref={lang === "es" ? "/me/matchfunding" : `/${lang}/me/matchfunding`}
        secondaryActionLabel="me.matchfunding.card.create"
        secondaryActionHref={lang === "es" ? "/matchfunding/new" : `/${lang}/matchfunding/new`}
        isEmpty={false}
    >
        {#if data?.recentCalls}
            {#each data.recentCalls.slice(0, 2) as call}
                <li class="flex flex-wrap items-center gap-[8px]">
                    <span
                        class="font-['Karla'] text-[14px] leading-[20px] font-semibold text-[#3d3d3d]"
                    >
                        {formatAmountWithSymbol(
                            call.donationAmount.amount,
                            call.donationAmount.currency,
                            lang,
                        )}
                    </span>
                    <span
                        class="font-['Karla'] text-[14px] leading-[20px] font-semibold text-[#3d3d3d]"
                    >
                        -
                    </span>
                    <span
                        class="font-['Karla'] text-[14px] leading-[20px] font-normal text-[#575757]"
                    >
                        {call.title}
                    </span>
                </li>
            {/each}
        {/if}
    </BaseActivityCard>
{/if}
