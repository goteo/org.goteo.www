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

    const DEFAULT_COVER = "https://placehold.co/4000x2700/D43111/FFFFFF?text=+&font=raleway";
    const DEFAULT_AVATAR = "https://placehold.co/204x204/00FF24/462949?text=User&font=raleway";

    const displayName = $derived(user.displayName ?? user.handle);
    const avatar = $derived(user.avatar ?? DEFAULT_AVATAR);

    const tabs = $derived([
        { id: "about", label: $t("profile.tabs.about") },
        { id: "projects", label: $t("profile.tabs.projects") },
        { id: "donorType", label: $t("profile.tabs.donorType") },
    ]);

    const bio = $derived(user.description);
</script>

<div class="flex w-full flex-col items-center">
    <!-- Hero: cover + avatar + action buttons -->
    <div class="relative h-100 w-full">
        <img src={DEFAULT_COVER} alt="" class="size-full object-cover" />

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
                <img src={avatar} alt={displayName} class="size-35 rounded-2xl object-cover" />
                <div class="absolute top-full left-1/2 size-12 -translate-x-1/2 -translate-y-1/2">
                    <VerifiedBadge />
                </div>
            </div>
        </div>
    </div>

    <!-- Name, location, social links -->
    <ProfileInfo {displayName} links={user.links} email={user.email} territory={user.territory} />

    <!-- Tabs -->
    <div class=" mt-8 w-full" style="--color-tertiary: var(--color-content)">
        <Tabs {tabs} />
    </div>

    <!-- Tab: Sobre el perfil -->
    <div data-tab-content="about" class="mx-auto mt-10 w-full max-w-3xl px-4 text-center">
        {#if bio}
            {#await renderMarkdown(bio)}
                <p class="text-content text-base leading-relaxed"></p>
            {:then html}
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

    <!-- Tab: Proyectos impulsados -->
    <div
        data-tab-content="projects"
        class="mx-auto mt-10 w-full max-w-5xl px-4"
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

    <!-- Tab: Tipo de donante -->
    <div data-tab-content="donorType" class="w-full" style="display:none">
        <ProfileDonorType {projectsDonated} {moneyDonatedAmount} {moneyDonatedCurrency} />
    </div>
</div>
