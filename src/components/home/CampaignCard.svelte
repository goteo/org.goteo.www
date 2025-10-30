<!--
Campaign Card Component (Svelte version)
Displays campaign information in a card format with responsive sizing
Converted from CampaignCard.astro to maintain exact functionality
-->
<script lang="ts">
    import type { Campaign, CampaignSize } from "../../types/campaign";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import MatchFundingIcon from "../../svgs/MatchFundingIcon.svelte";

    interface Props {
        size: CampaignSize;
        campaign: Campaign;
    }

    let { size, campaign }: Props = $props();

    // Define responsive classes based on size
    // Large cards span 2 columns in lg+ (3-column grid), 2 columns in md (2-column grid), full width on mobile
    const containerClasses = $derived(
        size === "large" ? "col-span-1 md:col-span-2 lg:col-span-2 h-[633px]" : "col-span-1 h-auto",
    );

    const imageHeight = "h-[389px]"; // Same height for both sizes
</script>

<div
    class="bg-light-surface border-light-muted min-w-0 grow basis-0 rounded-[32px] border p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] {containerClasses}"
    data-testid="campaign-card"
>
    <a href="/project/{campaign.id}">
        <div class="flex flex-col gap-6 {size === 'large' ? 'h-full' : ''}">
            <!-- Project Image -->
            <div
                class="relative {imageHeight} w-full rounded-3xl bg-cover bg-center"
                style="background-image: url('{campaign.image}')"
            >
                <!-- Tags Overlay -->
                <div class="absolute top-4 left-4 flex gap-2">
                    <!-- Matchfunding Tag (conditional) -->
                    {#if campaign.hasMatchfunding}
                        <div
                            class="bg-light-muted flex items-center gap-2 rounded border border-white px-2 py-1"
                        >
                            <MatchFundingIcon />
                            <span class="text-secondary text-sm font-bold whitespace-nowrap">
                                {$t("home.campaigns.matchfunding")}
                            </span>
                        </div>
                    {/if}

                    <!-- Additional Tags -->
                    {#if campaign.tags}
                        {#each campaign.tags as tag}
                            <div
                                class="bg-light-muted flex items-center gap-2 rounded border border-white px-2 py-1"
                            >
                                <span class="text-secondary text-sm font-bold whitespace-nowrap">
                                    {tag}
                                </span>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Project Content -->
            <div class="flex flex-col gap-6 {size === 'large' ? 'flex-1' : ''}">
                <h3 class="text-secondary max-h-16 overflow-hidden text-2xl leading-8 font-bold">
                    {campaign.title}
                </h3>

                <!-- Progress Bar -->
                <div class="flex flex-col gap-4">
                    <!-- Amount Information -->
                    <div class="flex items-start justify-between">
                        <div class="flex flex-col gap-1">
                            <span class="text-secondary text-base">
                                {$t("home.campaigns.obtained")}
                            </span>
                            <span class="text-secondary text-2xl font-bold">
                                {formatCurrency(
                                    campaign.obtained.amount,
                                    campaign.obtained.currency,
                                )}
                            </span>
                        </div>
                        <div class="flex flex-col gap-1 text-right">
                            <span class="text-secondary text-base">
                                {$t("home.campaigns.minimum")}
                            </span>
                            <span class="text-secondary text-2xl font-bold">
                                {formatCurrency(campaign.minimum.amount, campaign.minimum.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a>
</div>
