<script lang="ts">
    import CollabsCard from "./CollabsCard.svelte";
    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import type { Project, ProjectCollaboration } from "../../../openapi/client";
    import { currentDraft, navigateToStep } from "../../../stores/drafts/projectDraft";

    let { project }: { project: Project } = $props();

    let collabs = $state<ProjectCollaboration[]>($currentDraft?.wizardForm.collaborations || []);
    let loading = $state(false);

    /**
     * Handle Continue button
     * Simple navigation to next step (5) - validation happens on save/submit
     */
    function handleContinue() {
        navigateToStep(5);
    }

    async function loadCollabs() {
        loading = true;

        collabs = $currentDraft?.wizardForm.collaborations || [];

        loading = false;
    }

    $effect(() => {
        if ($currentDraft) loadCollabs();
    });
</script>

<div class="w-full space-y-10">
    <div class="flex w-full flex-col gap-4">
        <h2 class="text-[40px] leading-12 font-bold text-black">
            {$t("pages.project.edit.collaborations.title")}
        </h2>
        <p class="text-content text-base font-normal">
            {$t("pages.project.edit.collaborations.subtitle")}
        </p>
    </div>

    {#if loading}
        <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
    {:else}
        <Grid>
            {#each collabs as collab, index}
                <CollabsCard {project} {index} {collab} bind:loading />
            {/each}

            <CollabsCard isCreateCard={true} {project} collab={null} bind:loading />
        </Grid>
    {/if}

    <!-- Continue Button -->
    <div class="flex justify-start">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.collaborations.continue")}
        </Button>
    </div>
</div>
