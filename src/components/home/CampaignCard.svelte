<!--
Campaign Card Component (Svelte version)
Displays campaign information in a card format with responsive sizing
Converted from CampaignCard.astro to maintain exact functionality
-->
<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import Clock from "../../components/icons/Clock.svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import { gte } from "../../utils/money";
    import CampaignStatusBadge from "../home/CampaignStatusBadge.svelte";
    import Flames from "../icons/status/Flames.svelte";
    import Tag from "../library/tags/Tag.svelte";
    import Title from "../library/typography/Title.svelte";

    import { apiAccountingsIdGet, type Accounting, type Money } from "../../openapi/client";
    import type { Campaign, CampaignSize } from "../../types/campaign";
    import { extractId } from "../../utils/extractId";

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

    // Falls back to fetching the balance from the accounting IRI when the caller pre-loads no
    // `obtained`. Derived, not assigned in the effect, because effects don't run during SSR: a card
    // rendered statically (no `client:*` of its own) would ignore the pre-loaded value and show
    // "loading" forever — those callers must pre-load it.
    let fetched = $state<Money | undefined>(undefined);
    const obtained = $derived(campaign.obtained ?? fetched);

    $effect(() => {
        if (fetched === undefined && !campaign.obtained && campaign.accounting) {
            apiAccountingsIdGet({ path: { id: extractId(campaign.accounting)! } })
                .then(({ data }) => {
                    if (data?.balance) fetched = data.balance as Money;
                })
                .catch((error) => console.error("Error fetching campaign balance:", error));
        }
    });

    // Define responsive classes based on size
    // Large cards span 2 columns in lg+ (3-column grid), 2 columns in md (2-column grid), full width on mobile
    const sizeClasses = $derived(
        size === "large" ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1",
    );

    const imageHeight = "h-53.75"; // More rectangular proportions matching design

    // Calculate funding status and remaining amount
    const hasReachedMinimum = $derived(
        obtained != null && campaign.minimum != null ? gte(obtained, campaign.minimum) : false,
    );

    // Determine status badge text based on funding level
    // Using lookup pattern for consistency with other i18n implementations
    const statusBadgeText = $derived.by(() => {
        const key = hasReachedMinimum ? "minimumReached" : "goForMinimum";
        return $t(`pages.home.campaigns.status.${key}`);
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
        "border-grey grow basis-0 rounded-4xl border bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]",
        sizeClasses,
        className,
    )}
    data-testid="campaign-card"
>
    <a href="/project/{campaign.slug}">
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
                            <Flames />
                            <span>{$t("pages.home.campaigns.matchfunding")}</span>
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
                            <Clock />
                            <span class="text-sm text-black">
                                {$t("pages.home.campaigns.daysRemaining", {
                                    days: campaign.daysRemaining,
                                })}
                            </span>
                        </div>
                    {/if}

                    <!-- Category (display only first) -->
                    {#if firstCategory()}
                        <div class="flex items-center gap-2">
                            <Clock />
                            <span class="text-sm text-black">
                                {$t(`categories.${firstCategory()}`)}
                            </span>
                        </div>
                    {/if}
                </div>

                <!-- Title -->
                <Title
                    level={3}
                    variant="subsection"
                    color="secondary"
                    class="h-16 overflow-hidden leading-8"
                >
                    {campaign.title}
                </Title>

                <!-- Funding Information -->
                <div class="flex flex-col gap-2">
                    <!-- Obtained Amount -->
                    <div class="flex items-start justify-between">
                        <div class="flex flex-col gap-1">
                            <span class="text-secondary text-base"
                                >{$t("pages.home.campaigns.obtained")}</span
                            >
                            <span class="text-secondary text-2xl font-bold">
                                {#if obtained}
                                    {formatCurrency(obtained)}
                                {:else}
                                    <span class="text-content text-sm">{$t("system.loading")}</span>
                                {/if}
                            </span>
                        </div>
                        <!-- Remaining to Goal -->
                        <div class="flex flex-col gap-1 text-right">
                            {#if campaign.optimum && hasReachedMinimum}
                                <span class="text-secondary text-base">
                                    {$t("pages.home.campaigns.optimum")}
                                </span>
                                <span class="text-secondary text-2xl font-bold">
                                    {formatCurrency(campaign.optimum)}
                                </span>
                            {:else}
                                <span class="text-secondary text-base">
                                    {$t("pages.home.campaigns.minimum")}
                                </span>
                                <span class="text-secondary text-2xl font-bold">
                                    {formatCurrency(campaign.minimum)}
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
                            >{$t("pages.home.campaigns.userDonations")}</span
                        >
                        <span class="text-2xl font-bold text-black">
                            {formatCurrency(campaign.userDonations)}
                        </span>
                    </div>
                {/if}

                <!-- Owner Actions Footer -->
                {#if showOwnerActions}
                    <div class="flex w-full gap-4">
                        <button
                            class="border-secondary text-secondary hover:bg-secondary flex-1 rounded-3xl border px-4 py-4 text-base font-bold transition-colors hover:text-white"
                        >
                            {$t("pages.me.ownedProjects.messageToDonatorsButton")}
                        </button>
                        <button
                            class="bg-variant1 text-secondary hover:bg-purple-soft flex-1 rounded-3xl px-4 py-4 text-base font-bold transition-colors"
                        >
                            {$t("pages.me.ownedProjects.uploadNewsButton")}
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </a>
</div>
