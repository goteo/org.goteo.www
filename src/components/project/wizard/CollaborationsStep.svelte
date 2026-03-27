<script lang="ts">
    import CollabsCard from "./CollabsCard.svelte";
    import { t } from "../../../i18n/store";
    import { type Project } from "../../../openapi/client";
    import {
        navigateToStep,
        wizardState,
        type WizardCollaboration,
    } from "../../../stores/wizard-state";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";

    let { project } = $props<{
        project: Project;
    }>();

    let collabs = $state<WizardCollaboration[]>($wizardState.collaborations);
    let loading = $state(false);

    /**
     * Handle Continue button
     * Simple navigation to next step (5) - validation happens on save/submit
     */
    function handleContinue() {
        navigateToStep(5);
    }

    async function loadCollabs() {
        if (!project) return;
        loading = true;

        collabs = $wizardState.collaborations;

        loading = false;
    }

    $effect(() => {
        if ($wizardState) loadCollabs();
    });
</script>

<div class="w-full space-y-10">
    <div class="flex w-full flex-col gap-4">
        <h2 class="text-[40px] leading-12 font-bold text-black">
            {$t("wizard.steps.collaborations.title")}
        </h2>
        <p class="text-content text-base font-normal">
            {$t("wizard.steps.collaborations.subtitle")}
        </p>
    </div>

    {#if loading}
        <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
    {:else}
        <Grid>
            {#each collabs as collab, index}
                <CollabsCard {index} {collab} bind:loading />
            {/each}

            <CollabsCard isCreateCard={true} collab={null} bind:loading />
        </Grid>
    {/if}

    <!-- Continue Button -->
    <div class="flex justify-start">
        <Button
            kind="secondary"
            size="md"
            onclick={handleContinue}
            data-testid="collaborations-continue-btn"
        >
            {$t("wizard.collaborations.continue")}
        </Button>
    </div>
</div>
