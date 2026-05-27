<script lang="ts">
    import CampaignCard from "../../../../components/home/CampaignCard.svelte";
    import ShareIcon from "../../../../components/icons/Share.svelte";
    import Button from "../../../../components/library/Button.svelte";
    import Grid from "../../../../components/library/Grid.svelte";
    import ProfileDonorType from "../../../../components/profile/ProfileDonorType.svelte";
    import ProfileInfo from "../../../../components/profile/ProfileInfo.svelte";
    import Tabs from "../../../../components/Tabs.svelte";
    import { t } from "../../../../i18n/store";
    import VerifiedBadge from "../../../../svgs/VerifiedBadge.svelte";
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
        moneyDonatedCurrency = "EUR",
    }: Props = $props();

    const displayName = $derived(user.displayName ?? user.handle);

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
            <Button
                kind="secondary"
                size="md"
                onclick={() => navigator.share?.({ url: window.location.href })}
            >
                <ShareIcon class="size-5" />
                {$t("profile.share")}
            </Button>
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
                    <svg
                        width="140"
                        height="140"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="rounded-2xl"
                    >
                        <rect width="64" height="64" rx="8" fill="var(--color-variant1)" />
                        <path
                            d="M32.3156 14.5034C32.4028 14.4851 32.4119 14.5444 32.418 14.6067C33.8836 19.1802 36.0055 22.1742 38.761 25.2792C41.3975 28.2497 44.4463 31.0628 44.6956 36.2596C44.8912 40.3436 43.108 43.6454 41.2172 45.7C39.1074 47.9939 35.682 49.5727 32.111 49.4974C28.4401 49.4191 25.4353 47.7956 23.3118 45.3929C21.1967 43.0001 19.7432 39.9711 20.038 35.8484C20.4707 29.7889 25.0101 26.8298 27.9164 23.0217C29.8057 20.5438 31.1243 17.9808 32.3156 14.5034ZM24.7441 37.0813C24.7805 39.8472 26.2719 42.3723 28.3256 43.6492C31.2228 45.4499 35.253 44.9885 37.6364 42.6216C38.8944 41.3735 39.7485 39.6314 39.9895 37.0813C36.8081 37.0813 36.0821 37.0341 32.3854 37.0341C32.3854 34.5022 32.4187 31.8123 32.4187 29.2819C27.9983 29.2705 24.6903 32.925 24.7441 37.0813Z"
                            fill="var(--color-secondary)"
                        />
                    </svg>
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
