<script lang="ts">
    import RewardsCard from "./RewardsCard.svelte";
    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import type { Project, ProjectReward } from "../../../openapi/client";
    import { currentDraft, navigateToStep } from "../../../stores/drafts/projectDraft";

    let { project }: { project: Project } = $props();

    let rewards = $state<ProjectReward[]>($currentDraft?.wizardForm.rewards || []);
    let loading = $state(false);

    /**
     * Handle Continue button
     * Simple navigation to next step (4) - validation happens on save/submit
     */
    function handleContinue() {
        navigateToStep(4);
    }

    async function loadRewards() {
        loading = true;
        rewards = $currentDraft?.wizardForm.rewards || [];
        loading = false;
    }

    $effect(() => {
        if ($currentDraft) loadRewards();
    });
</script>

<div class="w-full space-y-10">
    <div class="flex w-full flex-col gap-4">
        <h2 class="text-[40px] leading-12 font-bold text-black">
            {$t("pages.project.edit.rewards.title")}
        </h2>
        <p class="text-content text-base font-normal">
            {$t("pages.project.edit.rewards.subtitle")}
        </p>
    </div>
    {#if loading}
        <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
    {:else}
        <Grid>
            {#each rewards as reward, index}
                <RewardsCard {project} {index} {reward} bind:loading />
            {/each}

            <RewardsCard isCreateCard={true} {project} reward={null} bind:loading />
        </Grid>
    {/if}

    <!-- Continue Button -->
    <div class="flex justify-start">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.rewards.continue")}
        </Button>
    </div>
</div>
