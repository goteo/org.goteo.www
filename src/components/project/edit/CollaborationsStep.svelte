<script lang="ts">
    import CollabsCard from "./CollabsCard.svelte";
    import { t } from "../../../i18n/store";
    import { currentDraft, navigateToStep } from "../../../stores/drafts/projectDraft";
    import Button from "../../library/buttons/Button.svelte";
    import Grid from "../../library/layout/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { Project, ProjectCollaboration } from "../../../openapi/client";

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
        <Title level={2} variant="headline">
            {$t("pages.project.edit.collaborations.title")}
        </Title>
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
