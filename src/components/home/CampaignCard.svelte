<!--
Campaign Card Component (Svelte version)
Displays campaign information in a card format with responsive sizing
Converted from CampaignCard.astro to maintain exact functionality
-->
<script lang="ts">
    import type { Campaign, CampaignSize } from "../../types/campaign";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import { twMerge } from "tailwind-merge";
    import MatchFundingIcon from "../../svgs/MatchFundingIcon.svelte";
    import ClockIcon from "../../svgs/ClockIcon.svelte";
    import CategoryIcon from "../../svgs/CategoryIcon.svelte";
    import Tag from "../library/Tag.svelte";
    import CampaignStatusBadge from "../library/CampaignStatusBadge.svelte";

    interface Props {
        size: CampaignSize;
        campaign: Campaign;
        showUserDonations?: boolean;
        showOwnerActions?: boolean;
        class?: string;
    }

    let {
        size,
        campaign,
        showUserDonations = false,
        showOwnerActions = false,
        class: className = "",
    }: Props = $props();

    // Define responsive classes based on size
    // Large cards span 2 columns in lg+ (3-column grid), 2 columns in md (2-column grid), full width on mobile
    const sizeClasses = $derived(
        size === "large" ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1",
    );

    const imageHeight = "h-[215px]"; // More rectangular proportions matching design

    // Calculate funding status and remaining amount
    const hasReachedMinimum = $derived(campaign.obtained.amount >= campaign.minimum.amount);

    // Determine status badge text based on funding level
    // Using lookup pattern for consistency with other i18n implementations
    const statusBadgeText = $derived.by(() => {
        const key = hasReachedMinimum ? "minimumReached" : "goForMinimum";
        return $t(`home.campaigns.status.${key}`);
    });

    // Calculate remaining amount (to minimum or optimum)
    const remainingToGoal = $derived(() => {
        if (hasReachedMinimum && campaign.optimum) {
            // Show remaining to optimum if minimum is reached
            const remaining = campaign.optimum.amount - campaign.obtained.amount;
            return {
                amount: remaining > 0 ? remaining : 0,
                label: $t("home.campaigns.remaining.toOptimum"),
                currency: campaign.optimum.currency,
            };
        } else {
            // Show remaining to minimum
            const remaining = campaign.minimum.amount - campaign.obtained.amount;
            return {
                amount: remaining > 0 ? remaining : 0,
                label: $t("home.campaigns.remaining.toMinimum"),
                currency: campaign.minimum.currency,
            };
        }
    });

    // Get first category only (as per review comments)
    const firstCategory = $derived(() => {
        if (Array.isArray(campaign.category)) {
            return campaign.category[0] || null;
        }
        return campaign.category || null;
    });
</script>

<div
    class={twMerge(
        "bg-light-surface border-grey grow basis-0 rounded-[32px] border p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]",
        sizeClasses,
        className,
    )}
    data-testid="campaign-card"
>
    <!-- Note: campaign.id is actually the project slug, not a numeric ID -->
    <a href="/project/{campaign.id}">
        <div class="flex flex-col gap-4 md:gap-6">
            <!-- Project Image -->
            <div
                class="relative {imageHeight} w-full rounded-3xl bg-cover bg-center"
                style="background-image: url('{campaign.image}')"
            >
                <!-- Tags Overlay (top-left) -->
                <div class="absolute top-4 left-4 flex gap-2">
                    <!-- Matchfunding Tag (conditional) -->
                    {#if campaign.hasMatchfunding}
                        <Tag>
                            <MatchFundingIcon />
                            <span>{$t("home.campaigns.matchfunding")}</span>
                        </Tag>
                    {/if}

                    <!-- Additional Tags -->
                    {#if campaign.tags}
                        {#each campaign.tags as tag}
                            <Tag>
                                {tag}
                            </Tag>
                        {/each}
                    {/if}
                </div>

                <!-- Status Badge (top-right) -->
                {#if campaign.status === "in_campaign"}
                    <div class="absolute top-4 right-4">
                        <CampaignStatusBadge text={statusBadgeText} />
                    </div>
                {/if}
            </div>

            <!-- Project Content -->
            <div class="flex flex-col gap-4 md:gap-6">
                <!-- Days Remaining & Category -->
                <div class="flex items-center gap-2 md:gap-4">
                    <!-- Days Remaining -->
                    {#if campaign.daysRemaining !== undefined}
                        <div class="flex items-center gap-2">
                            <ClockIcon />
                            <span class="text-sm text-black">
                                {$t("home.campaigns.daysRemaining", {
                                    days: campaign.daysRemaining,
                                })}
                            </span>
                        </div>
                    {/if}

                    <!-- Category (display only first) -->
                    {#if firstCategory()}
                        <div class="flex items-center gap-2">
                            <CategoryIcon />
                            <span class="text-sm text-black">
                                {$t(`categories.${firstCategory()}`)}
                            </span>
                        </div>
                    {/if}
                </div>

                <!-- Title -->
                <h3 class="text-secondary h-16 overflow-hidden text-2xl leading-8 font-bold">
                    {campaign.title}
                </h3>

                <!-- Funding Information -->
                <div class="flex flex-col gap-2">
                    <!-- Obtained Amount -->
                    <div class="flex items-start justify-between">
                        <div class="flex flex-col gap-1">
                            <span class="text-secondary text-base"
                                >{$t("home.campaigns.obtained")}</span
                            >
                            <span class="text-secondary text-2xl font-bold">
                                {formatCurrency(
                                    campaign.obtained.amount,
                                    campaign.obtained.currency,
                                )}
                            </span>
                        </div>
                        <!-- Remaining to Goal -->
                        <div class="flex flex-col gap-1 text-right">
                            {#if campaign.optimum && campaign.obtained.amount >= campaign.minimum.amount}
                                <span class="text-secondary text-base">
                                    {$t("home.campaigns.optimum")}
                                </span>
                                <span class="text-secondary text-2xl font-bold">
                                    {formatCurrency(
                                        campaign.optimum.amount,
                                        campaign.optimum.currency,
                                    )}
                                </span>
                            {:else}
                                <span class="text-secondary text-base">
                                    {$t("home.campaigns.minimum")}
                                </span>
                                <span class="text-secondary text-2xl font-bold">
                                    {formatCurrency(
                                        campaign.minimum.amount,
                                        campaign.minimum.currency,
                                    )}
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- User Donations Footer -->
                {#if showUserDonations && campaign.userDonations}
                    <div
                        class="bg-primary -mx-6 -mb-6 flex items-center justify-between rounded-b-3xl px-6 py-4"
                    >
                        <span class="text-base font-normal text-black"
                            >{$t("home.campaigns.userDonations")}</span
                        >
                        <span class="text-2xl font-bold text-black">
                            {formatCurrency(
                                campaign.userDonations.amount,
                                campaign.userDonations.currency,
                            )}
                        </span>
                    </div>
                {/if}

                <!-- Owner Actions Footer -->
                {#if showOwnerActions}
                    <div class="flex w-full gap-4">
                        <button
                            class="border-secondary text-secondary hover:bg-secondary flex-1 rounded-3xl border px-4 py-4 text-base font-bold transition-colors hover:text-white"
                        >
                            {$t("me.ownedProjects.messageToDonatorsButton")}
                        </button>
                        <button
                            class="bg-variant1 text-secondary hover:bg-light-accent flex-1 rounded-3xl px-4 py-4 text-base font-bold transition-colors"
                        >
                            {$t("me.ownedProjects.uploadNewsButton")}
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </a>
</div>
