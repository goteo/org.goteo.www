<script lang="ts">
    import RewardsCard from "./RewardsCard.svelte";
    import { t } from "../../../i18n/store";
    import { navigateToStep, wizardState, type WizardReward } from "../../../stores/wizard-state";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";

    let rewards = $state<WizardReward[]>($wizardState.rewards);
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
        rewards = $wizardState.rewards;
        loading = false;
    }

    $effect(() => {
        if ($wizardState) loadRewards();
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
                <RewardsCard {index} {reward} bind:loading />
            {/each}

            <RewardsCard isCreateCard={true} reward={null} bind:loading />
        </Grid>
    {/if}

    <!-- Continue Button -->
    <div class="flex justify-start">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.rewards.continue")}
        </Button>
    </div>
</div>
