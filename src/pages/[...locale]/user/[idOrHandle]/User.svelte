<script lang="ts">
    import CampaignCard from "../../../../components/home/CampaignCard.svelte";
    import DefaultAvatar from "../../../../components/icons/DefaultAvatar.svelte";
    import Grid from "../../../../components/library/layout/Grid.svelte";
    import ShareButton from "../../../../components/library/share/ShareButton.svelte";
    import ProfileDonorType from "../../../../components/profile/ProfileDonorType.svelte";
    import ProfileInfo from "../../../../components/profile/ProfileInfo.svelte";
    import VerifiedBadge from "../../../../components/profile/VerifiedBadge.svelte";
    import Tabs from "../../../../components/library/layout/Tabs.svelte";
    import { t } from "../../../../i18n/store";
    import { getDefaultCurrency } from "../../../../utils/consts";
    import { renderMarkdown } from "../../../../utils/renderMarkdown";

    import type { User } from "../../../../openapi/client/types.gen";
    import type { Campaign } from "../../../../types/campaign";

    interface Props {
        user: User;
        campaigns?: Campaign[];
        projectsDonated?: number;
        moneyDonatedAmount?: number;
        moneyDonatedCurrency?: string;
    }

    let {
        user,
        campaigns = [],
        projectsDonated = 0,
        moneyDonatedAmount = 0,
        moneyDonatedCurrency = getDefaultCurrency(),
    }: Props = $props();

    const displayName = $derived(user.displayName ?? user.handle);

    let pageUrl = $state("");
    $effect(() => {
        pageUrl = window.location.href;
    });

    const tabs = $derived([
        { id: "about", label: $t("profile.tabs.about") },
        { id: "projects", label: $t("profile.tabs.projects") },
        { id: "donorType", label: $t("profile.tabs.donorType") },
    ]);
</script>

<div class="flex w-full flex-col items-center">
    <!-- Hero: cover + avatar + action buttons -->
    <div class="bg-secondary relative h-100 w-full">
        <div class="absolute right-6 bottom-6 flex gap-3">
            <ShareButton
                variant="profile"
                url={pageUrl}
                buttonClass="bg-variant1 text-secondary rounded-3xl px-6 py-4"
            />
            <!--
                <Button kind="primary" size="sm">
                    {$t("profile.subscribe")}
                </Button>
            -->
        </div>

        <!-- Avatar overlapping cover bottom -->
        <div
            class="absolute top-full left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
            <div class="relative">
                {#if user.avatar}
                    <img
                        src={user.avatar}
                        alt={displayName}
                        class="size-35 rounded-2xl object-cover"
                    />
                {:else}
                    <DefaultAvatar class="size-35 rounded-2xl" />
                {/if}
                <div class="absolute top-full left-1/2 size-12 -translate-x-1/2 -translate-y-1/2">
                    <VerifiedBadge />
                </div>
            </div>
        </div>
    </div>

    <!-- Name, location, social links -->
    <ProfileInfo {displayName} links={user.links} email={user.email} territory={user.territory} />

    <!-- Tabs -->
    <div class="mt-8 w-full" style="--color-tertiary: var(--color-content)">
        <Tabs {tabs} />
    </div>

    <!-- Tab: About the profile -->
    <div data-tab-content="about" class="mx-auto mt-10 min-h-10 w-full max-w-3xl px-4 text-center">
        {#if user.description}
            {#await renderMarkdown(user.description) then html}
                <div class="prose prose-base text-content leading-6">
                    {@html html}
                </div>
            {/await}
        {:else}
            <p class="text-content text-base leading-relaxed">
                {$t("profile.noBio")}
            </p>
        {/if}
    </div>

    <!-- Tab: Supported projects -->
    <div
        data-tab-content="projects"
        class="mx-auto mt-10 min-h-10 w-full max-w-5xl px-4"
        style="display:none"
    >
        {#if campaigns.length > 0}
            <Grid class="grid-cols-1 gap-6 md:grid-cols-2">
                {#each campaigns as campaign}
                    <CampaignCard size="small" {campaign} />
                {/each}
            </Grid>
        {:else}
            <p class="text-content text-center text-base">{$t("profile.noProjects")}</p>
        {/if}
    </div>

    <!-- Tab: Donor type -->
    <div data-tab-content="donorType" class="w-full" style="display:none">
        <ProfileDonorType {projectsDonated} {moneyDonatedAmount} {moneyDonatedCurrency} />
    </div>
</div>
